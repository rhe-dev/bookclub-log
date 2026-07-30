import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { findBookSpec } from '../../../shared/bookprint/book-specs';
import { BookprintClient } from '../../../shared/bookprint/bookprint.client';
import { checkSpecEligibilityByUid } from '../../../shared/bookprint/spec-eligibility';
import { resolveStatusFromWebhook } from '../../../shared/bookprint/status-map';
import {
  isVendorFailure,
  VENDOR_STATUS_DISPLAY,
  type VendorWebhookEvent,
} from '../../../shared/bookprint/vendor-contract';
import { translateVendorError } from '../../../shared/bookprint/vendor-error';
import { ErrorCode } from '../../../shared/constants/error-code';
import { ManuscriptService } from '../../../shared/orders/manuscript.service';
import { orderInclude } from '../../../shared/orders/order.mapper';
import { OrdersSharedService } from '../../../shared/orders/orders-shared.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { toAdminOrderDto } from './admin-order.mapper';

/** 발송 웹훅이 실어 보내는 택배사 — 문서의 배송 SLA 기준 */
const TRACKING_CARRIER = '한진택배';

/**
 * 운영자의 제작 발주 — 북프린트 연동 (D-033·D-034, PLAN §5-1).
 *
 * 실제 파트너 운영 흐름을 그대로 옮긴다:
 *   ① 사양 재확인(판형·쪽수) → ② 발주(`POST /orders`) → ③ 이후 단계는 **웹훅 수신**
 *
 * 제작·배송 단계를 운영자가 임의로 누르지 않는 것이 핵심이다. 데모에서는 웹훅 수신 서버를
 * 둘 수 없어(외부 의존 배제) 운영자 화면의 시뮬레이터가 같은 경로로 이벤트를 흘린다.
 */
@Injectable()
export class AdminProductionService {
  private readonly logger = new Logger(AdminProductionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersShared: OrdersSharedService,
    private readonly manuscript: ManuscriptService,
    private readonly bookprint: BookprintClient,
  ) {}

  /**
   * 발주 전 사양 재확인.
   * 주문 당시 쪽수(스냅샷)와 **지금 다시 계산한 쪽수**를 함께 돌려준다 —
   * 주문 후 코멘트가 지워지거나 늘면 벤더가 거부할 수 있어, 그 차이를 운영자가 먼저 본다.
   */
  async check(orderPublicId: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: {
        ...orderInclude,
        vendorEvents: { orderBy: { receivedAt: 'asc' } },
      },
    });
    if (!order) throw new BadRequestException(ErrorCode.ORDER_NOT_FOUND);

    const bookIds = order.books.map((ob) => ob.bookId);
    const recalculated = await this.manuscript.estimatePages(bookIds);
    const eligibility = checkSpecEligibilityByUid(
      order.bookSpecUid,
      recalculated.pageCount,
    );
    const spec = findBookSpec(order.bookSpecUid);

    return {
      bookSpecUid: order.bookSpecUid,
      specName: spec?.name ?? order.bookSpecUid,
      pageMin: spec?.pageMin ?? null,
      pageMax: spec?.pageMax ?? null,
      /** 주문 시점에 벤더에 고지하기로 한 쪽수 */
      orderedPageCount: order.pageCount,
      /** 지금 다시 계산한 쪽수 */
      currentPageCount: recalculated.pageCount,
      eligible: eligibility?.eligible ?? false,
      ineligibleReason: eligibility?.reason ?? null,
      requiredValue: eligibility?.requiredValue ?? null,
      /** 발주 가능한 상태인지 — 주문 확인 단계 + 아직 발주 전 */
      canDispatch:
        order.status === OrderStatus.CONFIRMED && !order.vendorOrderUid,
      vendorOrderUid: order.vendorOrderUid,
      vendorStatus: order.vendorStatus,
      vendorStatusDisplay: order.vendorStatus
        ? (VENDOR_STATUS_DISPLAY[
            order.vendorStatus as keyof typeof VENDOR_STATUS_DISPLAY
          ] ?? order.vendorStatus)
        : null,
      vendorStatusAt: order.vendorStatusAt,
      trackingCarrier: order.trackingCarrier,
      trackingNumber: order.trackingNumber,
      /** 제작처 이벤트 수신 이력 — 우리 상태가 그대로인 이벤트도 여기에는 남는다 */
      events: order.vendorEvents.map((entry) => ({
        event: entry.event,
        vendorStatus: entry.vendorStatus,
        vendorStatusDisplay:
          VENDOR_STATUS_DISPLAY[
            entry.vendorStatus as keyof typeof VENDOR_STATUS_DISPLAY
          ] ?? entry.vendorStatus,
        receivedAt: entry.receivedAt,
        detail: entry.detail,
      })),
    };
  }

  /**
   * 북프린트 발주 — 여기서 충전금이 차감되고 제작 큐에 들어간다.
   * 그래서 이 시점이 **주문자 취소의 마감선**이다 (D-034).
   */
  async dispatch(orderPublicId: string, adminNote?: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: orderInclude,
    });
    if (!order) throw new BadRequestException(ErrorCode.ORDER_NOT_FOUND);
    if (order.vendorOrderUid)
      throw new BadRequestException(ErrorCode.PRINT_ALREADY_ORDERED);

    // 주문 이후 코멘트가 바뀌었을 수 있어 쪽수를 다시 계산해 보낸다
    const recalculated = await this.manuscript.estimatePages(
      order.books.map((ob) => ob.bookId),
    );
    const response = this.bookprint.createOrder({
      bookSpecUid: order.bookSpecUid,
      pageCount: recalculated.pageCount,
      copies: order.copies,
      productAmount: order.productAmount,
      shippingFee: order.shippingFee,
      externalRef: order.publicId,
    });

    if (isVendorFailure(response)) {
      const translated = translateVendorError(response);
      this.logger.warn(
        `발주 실패 order=${order.publicId} vendorCode=${translated.vendor.errorCode} retryable=${translated.retryable}`,
      );
      // 재시도해도 같은 결과인 요청은 400, 시간이 해결하는 것은 503으로 구분한다
      throw translated.retryable
        ? new ServiceUnavailableException(translated.code)
        : new BadRequestException(translated.code);
    }

    const updated = await this.ordersShared.applyTransition(
      order,
      OrderStatus.IN_PRODUCTION,
      ActorType.ADMIN,
      false,
      { adminNote },
      {
        pageCount: recalculated.pageCount,
        vendorOrderUid: response.data.orderUid,
        vendorStatus: response.data.orderStatus,
        vendorStatusAt: new Date(),
        // 발주 응답도 수신 로그의 시작점으로 남긴다 — PDF_UPLOAD라 즉시 PDF_READY로 승격된다
        vendorEvents: {
          create: {
            event: 'order.created',
            vendorStatus: response.data.orderStatus,
            detail: `발주 완료 · ${response.data.orderUid}`,
          },
        },
      },
    );
    return toAdminOrderDto(updated);
  }

  /**
   * 제작처 이벤트 수신 — 실제로는 웹훅 엔드포인트가 받을 것을 데모에서는 운영자가 흘려보낸다.
   * 여러 벤더 상태가 우리 한 단계로 접히므로, 우리 상태가 그대로인 이벤트도 있다.
   */
  async receiveVendorEvent(orderPublicId: string, event: VendorWebhookEvent) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: orderInclude,
    });
    if (!order) throw new BadRequestException(ErrorCode.ORDER_NOT_FOUND);
    if (!order.vendorOrderUid)
      throw new BadRequestException(ErrorCode.PRINT_NOT_ORDERED);

    const { vendorStatus, nextStatus } = resolveStatusFromWebhook(
      event,
      order.status,
    );
    const shipped = event === 'shipping.departed';
    const trackingNumber = shipped
      ? buildTrackingNumber(order.vendorOrderUid)
      : null;
    const vendorData = {
      vendorStatus,
      vendorStatusAt: new Date(),
      ...(shipped && {
        trackingCarrier: TRACKING_CARRIER,
        trackingNumber,
      }),
      // 우리 상태가 바뀌지 않는 이벤트도 로그에는 남는다 — 그래야 운영자가 진행을 본다
      vendorEvents: {
        create: {
          event,
          vendorStatus,
          detail: trackingNumber
            ? `${TRACKING_CARRIER} ${trackingNumber}`
            : null,
        },
      },
    };

    // 우리 상태가 바뀌지 않는 이벤트는 이력을 남기지 않고 벤더 정보만 갱신한다
    if (!nextStatus) {
      const updated = await this.prisma.order.update({
        where: { id: order.id },
        data: vendorData,
        include: orderInclude,
      });
      return toAdminOrderDto(updated);
    }

    const updated = await this.ordersShared.applyTransition(
      order,
      nextStatus,
      ActorType.VENDOR,
      false,
      undefined,
      vendorData,
    );
    return toAdminOrderDto(updated);
  }
}

/** 송장번호 — 형식만 재현한다 (벤더 주문번호에서 결정론적으로 만든다) */
function buildTrackingNumber(vendorOrderUid: string): string {
  const digits = [...vendorOrderUid]
    .map((char) => char.charCodeAt(0))
    .reduce((sum, code) => sum + code, 0);
  return `41${String(digits).padStart(9, '0').slice(0, 9)}`;
}
