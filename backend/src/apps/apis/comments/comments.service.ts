import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { ClubsService } from '../clubs/clubs.service';
import { ErrorCode } from '../../../shared/constants/error-code';
import {
  PaginationQuery,
  toPageMeta,
} from '../../../shared/dto/pagination.query';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { memberSummarySelect } from '../../../shared/prisma/selects';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const commentInclude = {
  member: memberSummarySelect,
  likes: { select: { memberId: true } },
} as const;

type CommentWithRelations = Prisma.CommentGetPayload<{
  include: typeof commentInclude;
}>;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly booksService: BooksService,
  ) {}

  async listForBook(
    bookPublicId: string,
    query: PaginationQuery,
    viewerPublicId?: string,
  ) {
    const book = await this.booksService.getBookOrThrow(bookPublicId);
    const viewerId = await this.resolveViewerId(viewerPublicId);
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
        // 코멘트는 최신순, 스레드 안의 답글은 대화 흐름대로 과거순
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ...commentInclude,
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: commentInclude,
          },
        },
      }),
    ]);
    return {
      items: threads.map((comment) => ({
        ...this.toDto(comment, viewerId),
        replies: comment.replies.map((reply) => this.toDto(reply, viewerId)),
      })),
      meta: toPageMeta(page, limit, totalCount),
    };
  }

  /** 내가 쓴 코멘트 — 클럽 무관 전체, 최신순 (삭제된 코멘트·삭제된 책 제외) */
  async listMine(memberPublicId: string | undefined, query: PaginationQuery) {
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CommentWhereInput = {
      memberId: member.id,
      deletedAt: null,
      book: { deletedAt: null },
    };
    const [totalCount, comments] = await this.prisma.$transaction([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          book: {
            select: {
              publicId: true,
              title: true,
              coverColor: true,
              coverEmoji: true,
              club: { select: { publicId: true, name: true } },
            },
          },
          _count: { select: { likes: true } },
        },
      }),
    ]);
    return {
      items: comments.map((comment) => ({
        publicId: comment.publicId,
        page: comment.page,
        quote: comment.quote,
        content: comment.content,
        createdAt: comment.createdAt,
        isEdited:
          comment.updatedAt.getTime() - comment.createdAt.getTime() > 1000,
        likeCount: comment._count.likes,
        book: {
          publicId: comment.book.publicId,
          title: comment.book.title,
          coverColor: comment.book.coverColor,
          coverEmoji: comment.book.coverEmoji,
        },
        club: comment.book.club,
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
        throw new NotFoundException(ErrorCode.REPLY_TARGET_NOT_FOUND);
      if (parent.bookId !== book.id)
        throw new BadRequestException(ErrorCode.REPLY_TO_OTHER_BOOK);
      if (parent.parentId !== null)
        throw new BadRequestException(ErrorCode.REPLY_DEPTH_EXCEEDED);
      if (parent.deletedAt)
        throw new BadRequestException(ErrorCode.REPLY_TO_DELETED);
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
      include: commentInclude,
    });
    return this.toDto(comment, member.id);
  }

  async update(
    commentPublicId: string,
    memberPublicId: string | undefined,
    dto: UpdateCommentDto,
  ) {
    const { comment, member } = await this.getOwnCommentOrThrow(
      commentPublicId,
      memberPublicId,
    );

    const data: Prisma.CommentUpdateInput = {};
    if (dto.content != null) data.content = dto.content;
    if (dto.page !== undefined) data.page = dto.page;
    if (dto.quote !== undefined) data.quote = dto.quote;
    // 변경 필드가 없으면 updatedAt을 건드리지 않는다 — 빈 PATCH가 '수정됨'을 만들지 않게
    if (Object.keys(data).length === 0) return this.toDto(comment, member.id);

    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data,
      include: commentInclude,
    });
    return this.toDto(updated, member.id);
  }

  async remove(commentPublicId: string, memberPublicId: string | undefined) {
    const { comment } = await this.getOwnCommentOrThrow(
      commentPublicId,
      memberPublicId,
    );
    await this.prisma.comment.update({
      where: { id: comment.id },
      data: { deletedAt: new Date() },
    });
    return { publicId: comment.publicId, deleted: true };
  }

  /** 공감 토글 — 이미 눌렀으면 해제. 삭제된 코멘트는 불가 */
  async toggleLike(
    commentPublicId: string,
    memberPublicId: string | undefined,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { publicId: commentPublicId },
    });
    if (!comment || comment.deletedAt)
      throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);
    const book = await this.prisma.book.findFirst({
      where: { id: comment.bookId, deletedAt: null },
    });
    if (!book) throw new NotFoundException(ErrorCode.BOOK_NOT_FOUND);
    const { member } = await this.clubsService.getMembershipOrThrow(
      book.clubId,
      memberPublicId,
    );

    const likeKey = {
      commentId_memberId: { commentId: comment.id, memberId: member.id },
    };
    // 토글을 원자적으로 — 동시 클릭의 중복 생성(P2002)은 '이미 공감됨'으로 흡수
    const removed = await this.prisma.commentLike.deleteMany({
      where: likeKey.commentId_memberId,
    });
    let liked = false;
    if (removed.count === 0) {
      try {
        await this.prisma.commentLike.create({
          data: likeKey.commentId_memberId,
        });
        liked = true;
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2002'
        )
          throw error;
        liked = true;
      }
    }
    const likeCount = await this.prisma.commentLike.count({
      where: { commentId: comment.id },
    });
    return { liked, likeCount };
  }

  /** 조회용 멤버 식별 — 헤더가 없거나 알 수 없는 값이면 비로그인처럼 취급 */
  private async resolveViewerId(viewerPublicId?: string) {
    if (!viewerPublicId) return null;
    const member = await this.prisma.member.findUnique({
      where: { publicId: viewerPublicId },
    });
    return member?.id ?? null;
  }

  private async getOwnCommentOrThrow(
    commentPublicId: string,
    memberPublicId: string | undefined,
  ) {
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    const comment = await this.prisma.comment.findUnique({
      where: { publicId: commentPublicId },
      include: commentInclude,
    });
    if (!comment || comment.deletedAt)
      throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);
    // 삭제된 책의 토론은 더 이상 수정·삭제할 수 없다 — toggleLike와 동일 기준
    const book = await this.prisma.book.findFirst({
      where: { id: comment.bookId, deletedAt: null },
    });
    if (!book) throw new NotFoundException(ErrorCode.BOOK_NOT_FOUND);
    if (comment.memberId !== member.id)
      throw new ForbiddenException(ErrorCode.COMMENT_AUTHOR_ONLY);
    return { comment, member };
  }

  private toDto(comment: CommentWithRelations, viewerId: number | null) {
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
        likeCount: 0,
        likedByMe: false,
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
      likeCount: comment.likes.length,
      likedByMe:
        viewerId !== null &&
        comment.likes.some((like) => like.memberId === viewerId),
    };
  }
}
