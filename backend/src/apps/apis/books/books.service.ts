import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { ClubsService } from '../clubs/clubs.service';
import { ErrorMessage } from '../../../shared/constants/error-message';
import { toPageMeta } from '../../../shared/dto/pagination.query';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { memberSummarySelect } from '../../../shared/prisma/selects';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQuery } from './dto/list-books.query';
import { UpdateBookDto } from './dto/update-book.dto';

const bookInclude = {
  participants: { include: { member: memberSummarySelect } },
  _count: { select: { comments: { where: { deletedAt: null } } } },
} satisfies Prisma.BookInclude;

type BookWithRelations = Prisma.BookGetPayload<{ include: typeof bookInclude }>;

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
  ) {}

  async list(clubPublicId: string, query: ListBooksQuery) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BookWhereInput = {
      clubId: club.id,
      deletedAt: null,
      ...(query.status && { status: query.status }),
    };
    const [totalCount, books] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        include: bookInclude,
        // 기간 미입력(null) 책이 최상단 — '설정 미완'을 책방 상단에서 바로 발견해 고치게 하려는 의도
        orderBy: [
          { periodFrom: { sort: 'desc', nulls: 'first' } },
          { id: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      items: books.map((book) => this.toDto(book)),
      meta: toPageMeta(page, limit, totalCount),
    };
  }

  async create(
    clubPublicId: string,
    memberPublicId: string | undefined,
    dto: CreateBookDto,
  ) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    await this.clubsService.assertLeader(club.id, memberPublicId);
    this.assertValidPeriod(
      dto.periodFrom ? new Date(dto.periodFrom) : null,
      dto.periodTo ? new Date(dto.periodTo) : null,
    );
    const participantMemberIds = await this.resolveParticipants(
      club.id,
      dto.participantIds ?? [],
    );
    const book = await this.prisma.book.create({
      data: {
        clubId: club.id,
        title: dto.title,
        author: dto.author,
        publisher: dto.publisher,
        coverColor: dto.coverColor,
        coverEmoji: dto.coverEmoji,
        status: dto.status ?? BookStatus.UPCOMING,
        meetingDate: dto.meetingDate ? new Date(dto.meetingDate) : null,
        periodFrom: dto.periodFrom ? new Date(dto.periodFrom) : null,
        periodTo: dto.periodTo ? new Date(dto.periodTo) : null,
        participants: {
          create: participantMemberIds.map((memberId) => ({ memberId })),
        },
      },
      include: bookInclude,
    });
    return this.toDto(book);
  }

  async detail(bookPublicId: string) {
    const book = await this.prisma.book.findFirst({
      where: { publicId: bookPublicId, deletedAt: null },
      include: bookInclude,
    });
    if (!book) throw new NotFoundException(ErrorMessage.BOOK_NOT_FOUND);
    return this.toDto(book);
  }

  async update(
    bookPublicId: string,
    memberPublicId: string | undefined,
    dto: UpdateBookDto,
  ) {
    const book = await this.getBookOrThrow(bookPublicId);
    await this.clubsService.assertLeader(book.clubId, memberPublicId);

    // 기간은 기존 값과 병합해 교차 검증 — 한쪽만 수정해도 순서가 깨지면 거부
    const nextPeriodFrom =
      dto.periodFrom !== undefined
        ? dto.periodFrom
          ? new Date(dto.periodFrom)
          : null
        : book.periodFrom;
    const nextPeriodTo =
      dto.periodTo !== undefined
        ? dto.periodTo
          ? new Date(dto.periodTo)
          : null
        : book.periodTo;
    this.assertValidPeriod(nextPeriodFrom, nextPeriodTo);

    const data: Prisma.BookUpdateInput = {};
    if (dto.title != null) data.title = dto.title;
    if (dto.author != null) data.author = dto.author;
    if (dto.publisher !== undefined) data.publisher = dto.publisher;
    if (dto.coverColor != null) data.coverColor = dto.coverColor;
    if (dto.coverEmoji != null) data.coverEmoji = dto.coverEmoji;
    if (dto.status != null) data.status = dto.status;
    if (dto.meetingDate !== undefined)
      data.meetingDate = dto.meetingDate ? new Date(dto.meetingDate) : null;
    if (dto.periodFrom !== undefined) data.periodFrom = nextPeriodFrom;
    if (dto.periodTo !== undefined) data.periodTo = nextPeriodTo;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.participantIds !== undefined) {
        const participantMemberIds = await this.resolveParticipants(
          book.clubId,
          dto.participantIds,
        );
        await tx.bookParticipant.deleteMany({ where: { bookId: book.id } });
        await tx.bookParticipant.createMany({
          data: participantMemberIds.map((memberId) => ({
            bookId: book.id,
            memberId,
          })),
        });
      }
      return tx.book.update({
        where: { id: book.id },
        data,
        include: bookInclude,
      });
    });
    return this.toDto(updated);
  }

  async softDelete(bookPublicId: string, memberPublicId: string | undefined) {
    const book = await this.getBookOrThrow(bookPublicId);
    await this.clubsService.assertLeader(book.clubId, memberPublicId);
    await this.prisma.book.update({
      where: { id: book.id },
      data: { deletedAt: new Date() },
    });
    return { publicId: book.publicId, deleted: true };
  }

  async getBookOrThrow(publicId: string) {
    const book = await this.prisma.book.findFirst({
      where: { publicId, deletedAt: null },
    });
    if (!book) throw new NotFoundException(ErrorMessage.BOOK_NOT_FOUND);
    return book;
  }

  private assertValidPeriod(from: Date | null, to: Date | null) {
    if (from && to && to < from)
      throw new BadRequestException(ErrorMessage.BOOK_PERIOD_INVALID);
  }

  /** 참여 회원 publicId 목록 → 내부 id 목록. 전원이 해당 모임 멤버인지 검증 */
  private async resolveParticipants(clubId: number, publicIds: string[]) {
    if (publicIds.length === 0) return [];
    const unique = [...new Set(publicIds)];
    const memberships = await this.prisma.clubMember.findMany({
      where: { clubId, member: { publicId: { in: unique } } },
    });
    if (memberships.length !== unique.length)
      throw new BadRequestException(ErrorMessage.BOOK_PARTICIPANT_NOT_IN_CLUB);
    return memberships.map((m) => m.memberId);
  }

  private toDto(book: BookWithRelations) {
    return {
      publicId: book.publicId,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      coverColor: book.coverColor,
      coverEmoji: book.coverEmoji,
      status: book.status,
      meetingDate: book.meetingDate,
      periodFrom: book.periodFrom,
      periodTo: book.periodTo,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      participants: book.participants.map((p) => p.member),
      commentCount: book._count.comments,
    };
  }
}
