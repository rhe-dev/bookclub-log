import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { ClubsService } from '../clubs/clubs.service';
import { ErrorMessage } from '../shared/constants/error-message';
import { PaginationQuery, toPageMeta } from '../shared/dto/pagination.query';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const memberSummary = {
  select: { publicId: true, name: true, avatarEmoji: true, color: true },
} as const;

type CommentWithMember = Prisma.CommentGetPayload<{
  include: { member: typeof memberSummary };
}>;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly booksService: BooksService,
  ) {}

  async listForBook(bookPublicId: string, query: PaginationQuery) {
    const book = await this.booksService.getBookOrThrow(bookPublicId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    // 삭제된 코멘트는 답글(비삭제)이 남아 있을 때만 '자리 유지'로 노출 (D-010)
    const where: Prisma.CommentWhereInput = {
      bookId: book.id,
      parentId: null,
      OR: [{ deletedAt: null }, { replies: { some: { deletedAt: null } } }],
    };
    const [totalCount, threads] = await this.prisma.$transaction([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          member: memberSummary,
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: { member: memberSummary },
          },
        },
      }),
    ]);
    return {
      items: threads.map((comment) => ({
        ...this.toDto(comment),
        replies: comment.replies.map((reply) => this.toDto(reply)),
      })),
      meta: toPageMeta(page, limit, totalCount),
    };
  }

  async create(
    bookPublicId: string,
    memberPublicId: string | undefined,
    dto: CreateCommentDto,
  ) {
    const book = await this.booksService.getBookOrThrow(bookPublicId);
    const { member } = await this.clubsService.getMembershipOrThrow(
      book.clubId,
      memberPublicId,
    );

    let parentInternalId: number | null = null;
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { publicId: dto.parentId },
      });
      if (!parent)
        throw new NotFoundException(ErrorMessage.REPLY_TARGET_NOT_FOUND);
      if (parent.bookId !== book.id)
        throw new BadRequestException(ErrorMessage.REPLY_TO_OTHER_BOOK);
      if (parent.parentId !== null)
        throw new BadRequestException(ErrorMessage.REPLY_DEPTH_EXCEEDED);
      if (parent.deletedAt)
        throw new BadRequestException(ErrorMessage.REPLY_TO_DELETED);
      parentInternalId = parent.id;
    }

    const comment = await this.prisma.comment.create({
      data: {
        bookId: book.id,
        memberId: member.id,
        parentId: parentInternalId,
        page: dto.page,
        quote: dto.quote,
        content: dto.content,
      },
      include: { member: memberSummary },
    });
    return this.toDto(comment);
  }

  async update(
    commentPublicId: string,
    memberPublicId: string | undefined,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.getOwnCommentOrThrow(
      commentPublicId,
      memberPublicId,
    );

    const data: Prisma.CommentUpdateInput = {};
    if (dto.content != null) data.content = dto.content;
    if (dto.page !== undefined) data.page = dto.page;
    if (dto.quote !== undefined) data.quote = dto.quote;
    // 변경 필드가 없으면 updatedAt을 건드리지 않는다 — 빈 PATCH가 '수정됨'을 만들지 않게
    if (Object.keys(data).length === 0) return this.toDto(comment);

    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data,
      include: { member: memberSummary },
    });
    return this.toDto(updated);
  }

  async remove(commentPublicId: string, memberPublicId: string | undefined) {
    const comment = await this.getOwnCommentOrThrow(
      commentPublicId,
      memberPublicId,
    );
    await this.prisma.comment.update({
      where: { id: comment.id },
      data: { deletedAt: new Date() },
    });
    return { publicId: comment.publicId, deleted: true };
  }

  private async getOwnCommentOrThrow(
    commentPublicId: string,
    memberPublicId: string | undefined,
  ): Promise<CommentWithMember> {
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    const comment = await this.prisma.comment.findUnique({
      where: { publicId: commentPublicId },
      include: { member: memberSummary },
    });
    if (!comment || comment.deletedAt)
      throw new NotFoundException(ErrorMessage.COMMENT_NOT_FOUND);
    if (comment.memberId !== member.id)
      throw new ForbiddenException(ErrorMessage.COMMENT_AUTHOR_ONLY);
    return comment;
  }

  private toDto(comment: CommentWithMember) {
    // 소프트 딜리트된 코멘트는 자리만 유지 — 내용·작성자 미노출 (D-010)
    if (comment.deletedAt) {
      return {
        publicId: comment.publicId,
        deleted: true,
        member: null,
        page: null,
        quote: null,
        content: null,
        createdAt: comment.createdAt,
        updatedAt: null,
        isEdited: false,
      };
    }
    return {
      publicId: comment.publicId,
      deleted: false,
      member: comment.member,
      page: comment.page,
      quote: comment.quote,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      // 생성 시 createdAt·updatedAt이 밀리초 단위로 어긋날 수 있어 1초 여유
      isEdited:
        comment.updatedAt.getTime() - comment.createdAt.getTime() > 1000,
    };
  }
}
