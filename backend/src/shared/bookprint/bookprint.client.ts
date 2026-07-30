import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { findBookSpec } from './book-specs';
import { checkSpecEligibility } from './spec-eligibility';
import {
  VENDOR_STATUS_DISPLAY,
  type VendorFailure,
  type VendorOrder,
  type VendorResponse,
} from './vendor-contract';

/**
 * 북프린트 API 목 클라이언트 (D-033).
 *
 * 실제 `api.sweetbook.com`은 호출하지 않는다(외부 의존 배제 요건). 대신 **계약을 지킨다** —
 * 성공/실패 응답 shape, `ERR_*` 코드, `fieldErrors[].constraint`, 상태 승격 규칙까지 문서 그대로.
 * 나중에 이 클래스만 실제 HTTP 클라이언트로 갈아끼우면 호출부는 그대로 둘 수 있다.
 *
 * 재현하는 규칙:
 * - 창작 방식은 `PDF_UPLOAD` 하나 → 주문 생성 시 표지·내지 PDF가 이미 준비돼 있으므로
 *   `PAID`를 거치지 않고 **즉시 `PDF_READY`로 승격**된다.
 * - 페이지 규칙 위반은 업로드가 아니라 **주문 생성**에서 400으로 막힌다.
 */
@Injectable()
export class BookprintClient {
  /** 벤더 식별자 형식 — 주문 `or_`, 책 `bk_` */
  private generateUid(prefix: string): string {
    return `${prefix}_${randomBytes(6).toString('hex')}`;
  }

  private fail(
    errorCode: VendorFailure['errorCode'],
    message: string,
    errors: string[],
    fieldErrors: VendorFailure['fieldErrors'] = [],
    data: VendorFailure['data'] = null,
  ): VendorFailure {
    return { success: false, errorCode, message, data, errors, fieldErrors };
  }

  /**
   * 주문 생성 (`POST /orders`).
   * 실패 케이스는 사양 검증에서 나온다 — 우리가 주문서에서 먼저 막기 때문에(D-035)
   * 여기까지 오면 대부분 통과하지만, 발주 직전 데이터가 바뀐 경우를 위해 벤더도 검증한다.
   */
  createOrder(input: {
    bookSpecUid: string;
    pageCount: number;
    copies: number;
    productAmount: number;
    shippingFee: number;
    /** 파트너 외부 참조 — 우리 주문 publicId */
    externalRef: string;
  }): VendorResponse<VendorOrder> {
    const spec = findBookSpec(input.bookSpecUid);
    if (!spec)
      return this.fail(
        'ERR_VALIDATION_FAILED',
        'Bad Request',
        ['존재하지 않는 판형입니다'],
        [
          {
            field: 'bookSpecUid',
            message: '허용된 판형이 아닙니다',
            currentValue: input.bookSpecUid,
            constraint: 'enum',
          },
        ],
      );

    const eligibility = checkSpecEligibility(spec, input.pageCount);
    if (!eligibility.eligible) {
      if (eligibility.reason === 'PAGE_MIN')
        return this.fail(
          'ERR_INSUFFICIENT_PAGES',
          'Bad Request',
          [`최소 페이지 미달: 현재 ${input.pageCount}p, 최소 ${spec.pageMin}p`],
          [
            {
              field: 'pageCount',
              message: `최소 ${spec.pageMin} 페이지가 필요합니다`,
              currentValue: input.pageCount,
              requiredValue: spec.pageMin,
              constraint: 'min',
            },
          ],
        );

      const isMax = eligibility.reason === 'PAGE_MAX';
      return this.fail(
        'ERR_PAGECOUNT_INVALID',
        'Bad Request',
        [
          isMax
            ? `최대 페이지 초과: 현재 ${input.pageCount}p, 최대 ${spec.pageMax}p`
            : `페이지 수는 ${spec.pageIncrement}의 배수여야 합니다`,
        ],
        [
          {
            field: 'pageCount',
            message: isMax
              ? `최대 ${spec.pageMax} 페이지까지 가능합니다`
              : `${spec.pageIncrement}의 배수만 허용됩니다`,
            currentValue: input.pageCount,
            requiredValue: isMax
              ? spec.pageMax
              : { min: spec.pageMin, increment: spec.pageIncrement },
            constraint: isMax ? 'max' : 'increment',
          },
        ],
      );
    }

    // PDF_UPLOAD 방식은 주문 시점에 PDF가 준비돼 있어 PAID를 건너뛴다
    return {
      success: true,
      message: '주문이 생성되었습니다',
      data: {
        orderUid: this.generateUid('or'),
        orderStatus: 'PDF_READY',
        orderStatusDisplay: VENDOR_STATUS_DISPLAY.PDF_READY,
        totalProductAmount: input.productAmount,
        totalShippingFee: input.shippingFee,
        totalAmount: input.productAmount + input.shippingFee,
        externalRef: input.externalRef,
        orderedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 주문 전체 취소 (`POST /orders/{uid}/cancel`).
   * 파트너가 직접 취소할 수 있는 건 `PAID`·`PDF_READY`까지다 — 그 이후는 관리자 승인 절차.
   */
  cancelOrder(
    orderUid: string,
    vendorStatus: string,
  ): VendorResponse<{ orderUid: string; orderStatus: 'CANCELLED_REFUND' }> {
    if (vendorStatus !== 'PAID' && vendorStatus !== 'PDF_READY')
      return this.fail('ERR_CONFLICT', 'Conflict', [
        '제작이 시작되어 취소할 수 없습니다',
      ]);

    return {
      success: true,
      message: '주문이 취소되었습니다',
      data: { orderUid, orderStatus: 'CANCELLED_REFUND' },
    };
  }
}
