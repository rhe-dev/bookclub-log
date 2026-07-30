import { Prisma } from '@prisma/client';
import { findBookSpec } from '../bookprint/book-specs';
import { memberSummarySelect } from '../prisma/selects';

/**
 * 판형 요약 — 카탈로그에서 빠진 판형(벤더가 단종)이라도 주문 이력은 남아야 하므로
 * 식별자만으로 최소 정보를 만들어 돌려준다.
 */
const toBookSpecSummary = (bookSpecUid: string) => {
  const spec = findBookSpec(bookSpecUid);
  return {
    bookSpecUid,
    name: spec?.name ?? bookSpecUid,
    coverType: spec?.coverType ?? null,
    bindingType: spec?.bindingType ?? null,
    innerTrimWidthMm: spec?.innerTrimWidthMm ?? null,
    innerTrimHeightMm: spec?.innerTrimHeightMm ?? null,
  };
};

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
  // 제작 사양 — 판형 이름·크기는 카탈로그에서 붙인다 (주문에는 식별자만 저장)
  bookSpec: toBookSpecSummary(order.bookSpecUid),
  coverColor: order.coverColor,
  coverEmoji: order.coverEmoji,
  pageCount: order.pageCount,
  unitPrice: order.unitPrice,
  productAmount: order.productAmount,
  shippingFee: order.shippingFee,
  totalAmount: order.productAmount + order.shippingFee,
  // 송장은 주문자도 배송 조회에 쓰므로 공용 — 벤더 주문번호·상태는 어드민 전용 (D-034)
  trackingCarrier: order.trackingCarrier,
  trackingNumber: order.trackingNumber,
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
