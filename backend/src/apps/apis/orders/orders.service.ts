import { Injectable } from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { PaginationQuery } from '../../../shared/dto/pagination.query';
import { TransitionOrderDto } from './dto/transition-order.dto';
import { ManuscriptService } from '../../../shared/orders/manuscript.service';
import { orderInclude, toOrderDto } from '../../../shared/orders/order.mapper';
import { OrdersSharedService } from '../../../shared/orders/orders-shared.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ClubsService } from '../clubs/clubs.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EstimateOrderDto } from './dto/estimate-order.dto';

/** 서비스(주문자) 관점의 주문 유스케이스 */
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly ordersShared: OrdersSharedService,
    private readonly manuscript: ManuscriptService,
  ) {}

  /** 문집 견적 — 분량·제작 가능 판형·금액·예상 수령일 (주문서 ②~④단계) */
  async estimate(
    clubPublicId: string,
    memberPublicId: string | undefined,
    dto: EstimateOrderDto,
  ) {
    const club = await this.clubsService.getClubOrThrow(clubPublicId);
    await this.clubsService.getMembershipOrThrow(club.id, memberPublicId);
    const books = await this.manuscript.resolveBooks(club.id, dto.bookIds);
    return this.manuscript.quote(books, dto.copies);
  }

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
    // 선택 순서를 수록 순서로 보존한다
    const orderedBooks = await this.manuscript.resolveBooks(
      club.id,
      dto.bookIds,
    );
    // 쪽수·금액은 서버가 다시 계산한다 — 클라이언트가 보낸 값은 믿지 않는다 (D-035)
    const { pageCount, quote } = await this.manuscript.finalize(
      orderedBooks,
      dto.bookSpecUid,
      dto.copies,
    );

    const order = await this.prisma.order.create({
      data: {
        clubId: club.id,
        memberId: member.id,
        title: dto.title,
        copies: dto.copies,
        bookSpecUid: dto.bookSpecUid,
        coverColor: dto.coverColor,
        coverEmoji: dto.coverEmoji,
        pageCount,
        unitPrice: quote.unitPrice,
        productAmount: quote.productAmount,
        shippingFee: quote.shippingFee,
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

  /** 주문자 전이 — 취소·구매 확정·환불/재제작 요청(사유 포함) */
  async transitionAsUser(
    orderPublicId: string,
    memberPublicId: string | undefined,
    dto: TransitionOrderDto,
  ) {
    const order = await this.ordersShared.findOrderOrThrow(orderPublicId);
    const member = await this.clubsService.getMemberOrThrow(memberPublicId);
    const updated = await this.ordersShared.applyTransition(
      order,
      dto.toStatus,
      ActorType.USER,
      member.id === order.memberId,
      { reason: dto.reason, reasonDetail: dto.reasonDetail },
    );
    return toOrderDto(updated);
  }
}
