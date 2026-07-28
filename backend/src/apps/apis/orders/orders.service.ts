import { BadRequestException, Injectable } from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { ErrorMessage } from '../../../shared/constants/error-message';
import { PaginationQuery } from '../../../shared/dto/pagination.query';
import { TransitionOrderDto } from '../../../shared/orders/dto/transition-order.dto';
import { orderInclude, toOrderDto } from '../../../shared/orders/order.mapper';
import { OrdersSharedService } from '../../../shared/orders/orders-shared.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateOrderDto } from './dto/create-order.dto';

/** 서비스(주문자) 관점의 주문 유스케이스 */
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly ordersShared: OrdersSharedService,
  ) {}

  /** 문집 주문 생성 — 주문자는 X-Member-Id의 멤버 (PLAN F3) */
  async create(
    clubPublicId: string,
    memberPublicId: string | undefined,
    dto: CreateOrderDto,
  ) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    const { member } = await this.clubsService.getMembershipOrThrow(
      club.id,
      memberPublicId,
    );
    const uniqueBookIds = [...new Set(dto.bookIds)];
    const books = await this.prisma.book.findMany({
      where: {
        publicId: { in: uniqueBookIds },
        clubId: club.id,
        deletedAt: null,
      },
    });
    if (books.length !== uniqueBookIds.length)
      throw new BadRequestException(ErrorMessage.ORDER_BOOK_INVALID);
    if (books.some((book) => book.status !== 'DONE'))
      throw new BadRequestException(ErrorMessage.ORDER_BOOK_NOT_DONE);

    // 선택(입력) 순서를 수록 순서로 보존
    const bookByPublicId = new Map(books.map((book) => [book.publicId, book]));
    const orderedBooks = uniqueBookIds.map((publicId) =>
      bookByPublicId.get(publicId)!,
    );

    const order = await this.prisma.order.create({
      data: {
        clubId: club.id,
        memberId: member.id,
        title: dto.title,
        copies: dto.copies,
        status: OrderStatus.RECEIVED,
        books: {
          create: orderedBooks.map((book, index) => ({
            bookId: book.id,
            position: index,
          })),
        },
        history: {
          create: {
            fromStatus: null,
            toStatus: OrderStatus.RECEIVED,
            actor: ActorType.USER,
          },
        },
      },
      include: orderInclude,
    });
    return toOrderDto(order);
  }

  /** 내 주문 목록 — 마이페이지용 */
  async listMine(memberPublicId: string | undefined, query: PaginationQuery) {
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    return this.ordersShared.paginate({ memberId: member.id }, query);
  }

  getOne(orderPublicId: string) {
    return this.ordersShared.getOne(orderPublicId);
  }

  /** 주문자 전이 — 취소·구매 확정·환불/재제작 요청(사유 포함) */
  async transitionAsUser(
    orderPublicId: string,
    memberPublicId: string | undefined,
    dto: TransitionOrderDto,
  ) {
    const order = await this.ordersShared.findOrderOrThrow(orderPublicId);
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    return this.ordersShared.applyTransition(
      order,
      dto.toStatus,
      ActorType.USER,
      member.id === order.memberId,
      { reason: dto.reason, reasonDetail: dto.reasonDetail },
    );
  }
}
