import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActorType,
  Order,
  OrderIssueReason,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { ErrorCode } from '../constants/error-code';
import { PaginationQuery, toPageMeta } from '../dto/pagination.query';
import { PrismaService } from '../prisma/prisma.service';
import { orderInclude, toOrderDto } from './order.mapper';
import { validateTransition } from './order-transitions';

/** 서비스/어드민 앱이 공유하는 주문 공통 로직 — 조회·페이지네이션·전이 실행 */
@Injectable()
export class OrdersSharedService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrderOrThrow(orderPublicId: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
    });
    if (!order) throw new NotFoundException(ErrorCode.ORDER_NOT_FOUND);
    return order;
  }

  async paginate(
    where: Prisma.OrderWhereInput,
    query: PaginationQuery,
    orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [totalCount, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      items: orders.map(toOrderDto),
      meta: toPageMeta(page, limit, totalCount),
    };
  }

  /** 전이 실행 — 전이 맵 검증 후 상태 변경과 이력 기록을 한 트랜잭션으로 */
  async applyTransition(
    order: Order,
    toStatus: OrderStatus,
    actor: ActorType,
    isOrderer: boolean,
    issue?: {
      reason?: OrderIssueReason;
      reasonDetail?: string;
      adminNote?: string;
    },
  ) {
    const error = validateTransition({
      from: order.status,
      to: toStatus,
      actor,
      isOrderer,
    });
    if (error === 'INVALID')
      throw new BadRequestException(ErrorCode.ORDER_INVALID_TRANSITION);
    if (error === 'ACTOR_FORBIDDEN')
      throw new ForbiddenException(
        actor === ActorType.USER
          ? ErrorCode.ORDER_ADMIN_ONLY_TRANSITION
          : ErrorCode.ORDER_ORDERER_ONLY,
      );
    if (error === 'NOT_ORDERER')
      throw new ForbiddenException(ErrorCode.ORDER_ORDERER_ONLY);

    // 환불·재제작 요청은 사유 필수, OTHER는 상세까지 — 그 외 전이에서는 사유를 기록하지 않는다
    const isIssueRequest =
      toStatus === OrderStatus.REFUND_REQUESTED ||
      toStatus === OrderStatus.REMAKE_REQUESTED;
    if (isIssueRequest && !issue?.reason)
      throw new BadRequestException(ErrorCode.ORDER_REASON_REQUIRED);
    if (isIssueRequest && issue?.reason === OrderIssueReason.OTHER) {
      const detail = issue.reasonDetail?.trim() ?? '';
      if (!detail)
        throw new BadRequestException(ErrorCode.ORDER_REASON_DETAIL_REQUIRED);
      if (detail.length < 5)
        throw new BadRequestException(ErrorCode.ORDER_REASON_DETAIL_MIN);
      // DTO의 MaxLength는 원문 기준이라 공백 패딩으로 우회 가능 — trim 후 다시 확인
      if (detail.length > 500)
        throw new BadRequestException(ErrorCode.ORDER_REASON_DETAIL_MAX);
    }

    const [, updated] = await this.prisma.$transaction([
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus,
          actor,
          reason: isIssueRequest ? issue!.reason : null,
          reasonDetail: isIssueRequest
            ? (issue!.reasonDetail?.trim() ?? null)
            : null,
          // 운영자 메모는 어느 전이에서든 남길 수 있다 (D-031)
          adminNote: issue?.adminNote?.trim() || null,
        },
      }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: toStatus, statusChangedAt: new Date() },
        include: orderInclude,
      }),
    ]);
    return toOrderDto(updated);
  }
}
