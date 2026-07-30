import { ActorType, OrderStatus } from '@prisma/client';
import { ORDER_TRANSITIONS, validateTransition } from './order-transitions';

const { USER, ADMIN } = ActorType;

describe('주문 상태 전이 맵 (PLAN §5, D-013)', () => {
  describe('순방향 7단계', () => {
    const forward: [OrderStatus, OrderStatus, ActorType][] = [
      [OrderStatus.RECEIVED, OrderStatus.CONFIRMED, ADMIN],
      [OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION, ADMIN],
      [OrderStatus.IN_PRODUCTION, OrderStatus.PRODUCED, ADMIN],
      [OrderStatus.PRODUCED, OrderStatus.SHIPPED, ADMIN],
      [OrderStatus.SHIPPED, OrderStatus.DELIVERED, ADMIN],
      [OrderStatus.DELIVERED, OrderStatus.PURCHASE_CONFIRMED, USER],
    ];

    it.each(forward)('%s → %s (%s) 허용', (from, to, actor) => {
      expect(
        validateTransition({ from, to, actor, isOrderer: true }),
      ).toBeNull();
    });
  });

  describe('역행·건너뛰기 거부', () => {
    it('역행(CONFIRMED → RECEIVED)은 거부한다', () => {
      expect(
        validateTransition({
          from: OrderStatus.CONFIRMED,
          to: OrderStatus.RECEIVED,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBe('INVALID');
    });

    it('건너뛰기(RECEIVED → IN_PRODUCTION)는 거부한다', () => {
      expect(
        validateTransition({
          from: OrderStatus.RECEIVED,
          to: OrderStatus.IN_PRODUCTION,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBe('INVALID');
    });

    it('건너뛰기(IN_PRODUCTION → DELIVERED)는 거부한다', () => {
      expect(
        validateTransition({
          from: OrderStatus.IN_PRODUCTION,
          to: OrderStatus.DELIVERED,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBe('INVALID');
    });
  });

  describe('취소 분기 — 제작 시작 전에만', () => {
    it.each([OrderStatus.RECEIVED, OrderStatus.CONFIRMED])(
      '%s에서 주문자 취소 허용',
      (from) => {
        expect(
          validateTransition({
            from,
            to: OrderStatus.CANCELED,
            actor: USER,
            isOrderer: true,
          }),
        ).toBeNull();
      },
    );

    it('관리자도 취소할 수 있다', () => {
      expect(
        validateTransition({
          from: OrderStatus.RECEIVED,
          to: OrderStatus.CANCELED,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBeNull();
    });

    it('제작 시작 후에는 취소할 수 없다', () => {
      expect(
        validateTransition({
          from: OrderStatus.IN_PRODUCTION,
          to: OrderStatus.CANCELED,
          actor: USER,
          isOrderer: true,
        }),
      ).toBe('INVALID');
    });

    it('주문자가 아닌 멤버는 취소할 수 없다', () => {
      expect(
        validateTransition({
          from: OrderStatus.RECEIVED,
          to: OrderStatus.CANCELED,
          actor: USER,
          isOrderer: false,
        }),
      ).toBe('NOT_ORDERER');
    });
  });

  describe('구매 확정 권한 — 주문자만', () => {
    it('관리자는 구매 확정할 수 없다', () => {
      expect(
        validateTransition({
          from: OrderStatus.DELIVERED,
          to: OrderStatus.PURCHASE_CONFIRMED,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBe('ACTOR_FORBIDDEN');
    });

    it('주문자가 아닌 멤버는 구매 확정할 수 없다', () => {
      expect(
        validateTransition({
          from: OrderStatus.DELIVERED,
          to: OrderStatus.PURCHASE_CONFIRMED,
          actor: USER,
          isOrderer: false,
        }),
      ).toBe('NOT_ORDERER');
    });
  });

  describe('환불·재제작 분기 — 배송 완료 후 하자 시에만', () => {
    it('배송완료에서 주문자만 환불·재제작을 요청할 수 있다', () => {
      for (const to of [
        OrderStatus.REFUND_REQUESTED,
        OrderStatus.REMAKE_REQUESTED,
      ]) {
        expect(
          validateTransition({
            from: OrderStatus.DELIVERED,
            to,
            actor: USER,
            isOrderer: true,
          }),
        ).toBeNull();
        expect(
          validateTransition({
            from: OrderStatus.DELIVERED,
            to,
            actor: ADMIN,
            isOrderer: false,
          }),
        ).toBe('ACTOR_FORBIDDEN');
      }
    });

    it('배송완료 전에는 환불을 요청할 수 없다', () => {
      expect(
        validateTransition({
          from: OrderStatus.SHIPPED,
          to: OrderStatus.REFUND_REQUESTED,
          actor: USER,
          isOrderer: true,
        }),
      ).toBe('INVALID');
    });

    it('환불 처리는 관리자만 한다', () => {
      expect(
        validateTransition({
          from: OrderStatus.REFUND_REQUESTED,
          to: OrderStatus.REFUNDED,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBeNull();
      expect(
        validateTransition({
          from: OrderStatus.REFUND_REQUESTED,
          to: OrderStatus.REFUNDED,
          actor: USER,
          isOrderer: true,
        }),
      ).toBe('ACTOR_FORBIDDEN');
    });

    it('재제작 승인 시 제작 단계로 재진입한다(관리자)', () => {
      expect(
        validateTransition({
          from: OrderStatus.REMAKE_REQUESTED,
          to: OrderStatus.IN_PRODUCTION,
          actor: ADMIN,
          isOrderer: false,
        }),
      ).toBeNull();
    });
  });

  describe('종결 상태', () => {
    it.each([
      OrderStatus.PURCHASE_CONFIRMED,
      OrderStatus.CANCELED,
      OrderStatus.REFUNDED,
    ])('%s에서는 어떤 전이도 불가하다', (from) => {
      expect(ORDER_TRANSITIONS[from]).toHaveLength(0);
      for (const to of Object.values(OrderStatus)) {
        expect(
          validateTransition({ from, to, actor: ADMIN, isOrderer: true }),
        ).toBe('INVALID');
      }
    });
  });
});
