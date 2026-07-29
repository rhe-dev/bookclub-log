import { Prisma } from '@prisma/client';
import { memberSummarySelect } from '../prisma/selects';

/** 주문 응답 공통 include — 서비스/어드민 앱이 함께 사용 */
export const orderInclude = {
  club: { select: { publicId: true, name: true } },
  member: memberSummarySelect,
  // 수록 책은 소프트 딜리트돼도 유지 — 주문은 제작 시점 스냅샷이라 이력을 보존한다
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
  statusChangedAt: order.statusChangedAt,
  club: order.club,
  member: order.member,
  books: order.books.map((ob) => ob.book),
  history: order.history.map((h) => ({
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    changedAt: h.changedAt,
    actor: h.actor,
    reason: h.reason,
    reasonDetail: h.reasonDetail,
    adminNote: h.adminNote,
  })),
});
