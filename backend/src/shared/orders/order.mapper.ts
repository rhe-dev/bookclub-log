import { Prisma } from '@prisma/client';
import { memberSummarySelect } from '../prisma/selects';

/** 주문 응답 공통 include — 서비스/어드민 앱이 함께 사용 */
export const orderInclude = {
  member: memberSummarySelect,
  books: {
    orderBy: { position: 'asc' as const },
    include: {
      book: {
        select: {
          publicId: true,
          title: true,
          author: true,
          coverColor: true,
          coverEmoji: true,
        },
      },
    },
  },
  history: { orderBy: { changedAt: 'asc' as const } },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export const toOrderDto = (order: OrderWithRelations) => ({
  publicId: order.publicId,
  title: order.title,
  copies: order.copies,
  status: order.status,
  createdAt: order.createdAt,
  member: order.member,
  books: order.books.map((ob) => ob.book),
  history: order.history.map((h) => ({
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    changedAt: h.changedAt,
    actor: h.actor,
  })),
});
