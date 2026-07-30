import { ActorType, OrderStatus } from '@prisma/client';

interface TransitionRule {
  to: OrderStatus;
  actors: ActorType[];
}

/**
 * 주문 상태 전이 맵 — 단일 소스 (PLAN §5, D-013).
 * 순방향 7단계 + 분기(취소·환불·재제작). USER 전이는 주문자 본인만 가능하다.
 * 제작·배송 단계(IN_PRODUCTION 이후)는 운영자가 임의로 누르는 것이 아니라
 * 제작처 웹훅 수신으로 전이된다 — ADMIN·VENDOR 둘 다 주체가 될 수 있다 (D-034).
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, TransitionRule[]> = {
  RECEIVED: [
    { to: OrderStatus.CONFIRMED, actors: [ActorType.ADMIN] },
    { to: OrderStatus.CANCELED, actors: [ActorType.USER, ActorType.ADMIN] },
  ],
  CONFIRMED: [
    { to: OrderStatus.IN_PRODUCTION, actors: [ActorType.ADMIN] },
    { to: OrderStatus.CANCELED, actors: [ActorType.USER, ActorType.ADMIN] },
  ],
  IN_PRODUCTION: [
    { to: OrderStatus.PRODUCED, actors: [ActorType.ADMIN, ActorType.VENDOR] },
  ],
  PRODUCED: [
    { to: OrderStatus.SHIPPED, actors: [ActorType.ADMIN, ActorType.VENDOR] },
  ],
  SHIPPED: [
    { to: OrderStatus.DELIVERED, actors: [ActorType.ADMIN, ActorType.VENDOR] },
  ],
  DELIVERED: [
    { to: OrderStatus.PURCHASE_CONFIRMED, actors: [ActorType.USER] },
    { to: OrderStatus.REFUND_REQUESTED, actors: [ActorType.USER] },
    { to: OrderStatus.REMAKE_REQUESTED, actors: [ActorType.USER] },
  ],
  REFUND_REQUESTED: [{ to: OrderStatus.REFUNDED, actors: [ActorType.ADMIN] }],
  REMAKE_REQUESTED: [
    { to: OrderStatus.IN_PRODUCTION, actors: [ActorType.ADMIN] },
  ],
  // 종결 상태
  PURCHASE_CONFIRMED: [],
  CANCELED: [],
  REFUNDED: [],
};

/** 해당 행위자가 지금 진행할 수 있는 다음 상태들 — 화면이 전이 맵을 복제하지 않도록 서버가 알려준다 */
export function getAvailableTransitions(
  from: OrderStatus,
  actor: ActorType,
): OrderStatus[] {
  return ORDER_TRANSITIONS[from]
    .filter((rule) => rule.actors.includes(actor))
    .map((rule) => rule.to);
}

export type TransitionError = 'INVALID' | 'ACTOR_FORBIDDEN' | 'NOT_ORDERER';

/** 전이 가능 여부 판정 — 실패 사유를 반환, 통과면 null */
export function validateTransition(params: {
  from: OrderStatus;
  to: OrderStatus;
  actor: ActorType;
  isOrderer: boolean;
}): TransitionError | null {
  const rule = ORDER_TRANSITIONS[params.from].find((r) => r.to === params.to);
  if (!rule) return 'INVALID';
  if (!rule.actors.includes(params.actor)) return 'ACTOR_FORBIDDEN';
  if (params.actor === ActorType.USER && !params.isOrderer)
    return 'NOT_ORDERER';
  return null;
}
