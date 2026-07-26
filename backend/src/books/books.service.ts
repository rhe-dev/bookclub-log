import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { ClubsService } from '../clubs/clubs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const memberSummary = {
  select: { publicId: true, name: true, avatarEmoji: true, color: true },
} as const;

const bookInclude = {
  participants: { include: { member: memberSummary } },
  _count: { select: { comments: { where: { deletedAt: null } } } },
} satisfies Prisma.BookInclude;

type BookWithRelations = Prisma.BookGetPayload<{ include: typeof bookInclude }>;

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
  ) {}

  async list(clubPublicId: string, status?: BookStatus) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    const books = await this.prisma.book.findMany({
      where: { clubId: club.id, deletedAt: null, ...(status && { status }) },
      include: bookInclude,
      orderBy: [{ periodFrom: 'desc' }, { id: 'desc' }],
    });
    return books.map((book) => this.toDto(book));
  }

  async create(
    clubPublicId: string,
    memberPublicId: string | undefined,
    dto: CreateBookDto,
  ) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    await this.clubsService.assertLeader(club.id, memberPublicId);
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
    if (!book) throw new NotFoundException('책을 찾을 수 없습니다.');
    return this.toDto(book);
  }

  async update(
    bookPublicId: string,
    memberPublicId: string | undefined,
    dto: UpdateBookDto,
  ) {
    const book = await this.getBookOrThrow(bookPublicId);
    await this.clubsService.assertLeader(book.clubId, memberPublicId);

    const data: Prisma.BookUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.author !== undefined) data.author = dto.author;
    if (dto.publisher !== undefined) data.publisher = dto.publisher;
    if (dto.coverColor !== undefined) data.coverColor = dto.coverColor;
    if (dto.coverEmoji !== undefined) data.coverEmoji = dto.coverEmoji;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.meetingDate !== undefined)
      data.meetingDate = new Date(dto.meetingDate);
    if (dto.periodFrom !== undefined)
      data.periodFrom = new Date(dto.periodFrom);
    if (dto.periodTo !== undefined) data.periodTo = new Date(dto.periodTo);

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
    if (!book) throw new NotFoundException('책을 찾을 수 없습니다.');
    return book;
  }

  /** 참여 회원 publicId 목록 → 내부 id 목록. 전원이 해당 모임 멤버인지 검증 */
  private async resolveParticipants(clubId: number, publicIds: string[]) {
    if (publicIds.length === 0) return [];
    const unique = [...new Set(publicIds)];
    const memberships = await this.prisma.clubMember.findMany({
      where: { clubId, member: { publicId: { in: unique } } },
    });
    if (memberships.length !== unique.length)
      throw new BadRequestException(
        '참여 회원 목록에 이 모임의 멤버가 아닌 사람이 있습니다.',
      );
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
