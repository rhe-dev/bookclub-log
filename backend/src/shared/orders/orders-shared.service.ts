import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActorType, Order, OrderStatus, Prisma } from '@prisma/client';
import { ErrorMessage } from '../constants/error-message';
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
    if (!order) throw new NotFoundException(ErrorMessage.ORDER_NOT_FOUND);
    return order;
  }

  async getOne(orderPublicId: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException(ErrorMessage.ORDER_NOT_FOUND);
    return toOrderDto(order);
  }

  async paginate(where: Prisma.OrderWhereInput, query: PaginationQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [totalCount, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
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
  ) {
    const error = validateTransition({
      from: order.status,
      to: toStatus,
      actor,
      isOrderer,
    });
    if (error === 'INVALID')
      throw new BadRequestException(ErrorMessage.ORDER_INVALID_TRANSITION);
    if (error === 'ACTOR_FORBIDDEN')
      throw new ForbiddenException(
        actor === ActorType.USER
          ? ErrorMessage.ORDER_ADMIN_ONLY_TRANSITION
          : ErrorMessage.ORDER_ORDERER_ONLY,
      );
    if (error === 'NOT_ORDERER')
      throw new ForbiddenException(ErrorMessage.ORDER_ORDERER_ONLY);

    const [, updated] = await this.prisma.$transaction([
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus,
          actor,
        },
      }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: toStatus },
        include: orderInclude,
      }),
    ]);
    return toOrderDto(updated);
  }
}
