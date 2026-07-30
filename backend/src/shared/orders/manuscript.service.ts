import { BadRequestException, Injectable } from '@nestjs/common';
import type { Book } from '@prisma/client';
import {
  BOOK_SPECS,
  findBookSpec,
  SHIPPING_FEE,
} from '../bookprint/book-specs';
import { estimateDelivery } from '../bookprint/delivery-estimate';
import {
  estimatePageCount,
  type PageEstimate,
} from '../bookprint/page-estimate';
import {
  checkCatalogEligibility,
  checkSpecEligibility,
  hasEligibleSpec,
} from '../bookprint/spec-eligibility';
import { quoteOrder, type Quote } from '../bookprint/pricing';
import { ErrorCode } from '../constants/error-code';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 문집 원고(manuscript) 산출 — 수록 책 → 분량 → 제작 가능 판형 → 견적 (D-035).
 *
 * 주문서 견적 화면, 주문 생성 검증, 운영자 발주 직전 재확인이 **모두 이 계산을 공유**한다.
 * 화면이 계산을 복제하면 서버와 어긋나고, 그 어긋남은 벤더가 주문을 거부하는 순간에야 드러난다.
 */
@Injectable()
export class ManuscriptService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 수록 책 검증 + 선택 순서 보존.
   * 완독(DONE)한 책만 문집에 실을 수 있다 — 토론이 끝난 기록만 묶는다는 규칙.
   */
  async resolveBooks(clubId: number, bookPublicIds: string[]): Promise<Book[]> {
    const uniqueIds = [...new Set(bookPublicIds)];
    const books = await this.prisma.book.findMany({
      where: { publicId: { in: uniqueIds }, clubId, deletedAt: null },
    });
    if (books.length !== uniqueIds.length)
      throw new BadRequestException(ErrorCode.ORDER_BOOK_INVALID);
    if (books.some((book) => book.status !== 'DONE'))
      throw new BadRequestException(ErrorCode.ORDER_BOOK_NOT_DONE);

    const byPublicId = new Map(books.map((book) => [book.publicId, book]));
    return uniqueIds.map((publicId) => byPublicId.get(publicId)!);
  }

  /** 수록 책들의 살아있는 코멘트 수로 분량을 산출한다 (답글 포함) */
  async estimatePages(bookIds: number[]): Promise<PageEstimate> {
    const grouped = await this.prisma.comment.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds }, deletedAt: null },
      _count: { _all: true },
    });
    const countByBookId = new Map(
      grouped.map((row) => [row.bookId, row._count._all]),
    );

    return estimatePageCount(
      bookIds.map((bookId) => ({
        commentCount: countByBookId.get(bookId) ?? 0,
      })),
    );
  }

  /**
   * 주문서용 견적 — 분량 + 판형별 제작 가능 여부 + 판형별 금액 + 예상 수령일.
   * 어떤 판형으로도 만들 수 없으면(분량 미달) 그 자체가 사용자에게 알려야 할 결과다.
   */
  async quote(books: Book[], copies: number) {
    const pages = await this.estimatePages(books.map((book) => book.id));
    const eligibility = checkCatalogEligibility(pages.pageCount);
    const eligibilityByUid = new Map(
      eligibility.map((item) => [item.bookSpecUid, item]),
    );

    return {
      ...pages,
      /** 어떤 판형으로도 제작할 수 없는 분량인지 — 주문 진입 자체를 막는 조건 */
      printable: hasEligibleSpec(pages.pageCount),
      specs: BOOK_SPECS.map((spec) => {
        const check = eligibilityByUid.get(spec.bookSpecUid)!;
        return {
          ...spec,
          eligible: check.eligible,
          ineligibleReason: check.reason ?? null,
          requiredValue: check.requiredValue ?? null,
          // 만들 수 없는 판형도 금액은 계산해 둔다 — 카드에 참고 가격을 보여주기 위해
          ...quoteOrder(spec, pages.pageCount, copies),
        };
      }),
      shippingFee: SHIPPING_FEE,
      delivery: estimateDelivery(new Date()),
    };
  }

  /**
   * 주문 생성·발주 시 확정 사양 계산 — 클라이언트가 보낸 쪽수·금액은 믿지 않는다.
   * 판형이 카탈로그에 없거나 분량이 그 판형의 규칙을 벗어나면 여기서 막는다.
   */
  async finalize(
    books: Book[],
    bookSpecUid: string,
    copies: number,
  ): Promise<{ pageCount: number; quote: Quote }> {
    const spec = findBookSpec(bookSpecUid);
    if (!spec) throw new BadRequestException(ErrorCode.PRINT_SPEC_NOT_FOUND);

    const pages = await this.estimatePages(books.map((book) => book.id));
    const eligibility = checkSpecEligibility(spec, pages.pageCount);
    if (!eligibility.eligible)
      throw new BadRequestException(INELIGIBLE_ERROR[eligibility.reason!]);

    return {
      pageCount: pages.pageCount,
      quote: quoteOrder(spec, pages.pageCount, copies),
    };
  }
}

/** 판형 규칙 위반 사유 → 사용자에게 보여줄 도메인 코드 */
const INELIGIBLE_ERROR = {
  PAGE_MIN: ErrorCode.PRINT_PAGE_MIN,
  PAGE_MAX: ErrorCode.PRINT_PAGE_MAX,
  PAGE_INCREMENT: ErrorCode.PRINT_PAGE_INCREMENT,
} as const;
