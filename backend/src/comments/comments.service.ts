import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { ClubsService } from '../clubs/clubs.service';
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

  async listForBook(bookPublicId: string) {
    const book = await this.booksService.getBookOrThrow(bookPublicId);
    const threads = await this.prisma.comment.findMany({
      where: { bookId: book.id, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        member: memberSummary,
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { member: memberSummary },
        },
      },
    });
    return threads.map((comment) => ({
      ...this.toDto(comment),
      replies: comment.replies.map((reply) => this.toDto(reply)),
    }));
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
        throw new NotFoundException('답글 대상 코멘트를 찾을 수 없습니다.');
      if (parent.bookId !== book.id)
        throw new BadRequestException(
          '다른 책의 코멘트에는 답글을 달 수 없습니다.',
        );
      if (parent.parentId !== null)
        throw new BadRequestException('답글에는 답글을 달 수 없습니다.');
      if (parent.deletedAt)
        throw new BadRequestException(
          '삭제된 코멘트에는 답글을 달 수 없습니다.',
        );
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
    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.page !== undefined && { page: dto.page }),
        ...(dto.quote !== undefined && { quote: dto.quote }),
      },
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
      throw new NotFoundException('코멘트를 찾을 수 없습니다.');
    if (comment.memberId !== member.id)
      throw new ForbiddenException('작성자만 할 수 있습니다.');
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
