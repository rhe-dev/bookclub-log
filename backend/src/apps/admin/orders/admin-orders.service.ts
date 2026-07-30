import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { findBookSpec } from '../../../shared/bookprint/book-specs';
import { ErrorCode } from '../../../shared/constants/error-code';
import { orderInclude } from '../../../shared/orders/order.mapper';
import { toAdminOrderDto } from './admin-order.mapper';
import {
  ORDER_ISSUE_REASON_LABEL,
  ORDER_STATUS_LABEL,
} from './order-status-label';
import { OrdersSharedService } from '../../../shared/orders/orders-shared.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AdminOrdersQuery } from './dto/admin-orders.query';

/** 운영자 관점의 주문 유스케이스 — 목록·단계 진행·CSV */
@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersShared: OrdersSharedService,
  ) {}

  async listAll(query: AdminOrdersQuery) {
    const { page: pageNo, limit } = query;
    const page = await this.ordersShared.paginate(
      toWhere(query),
      { page: pageNo, limit },
      toOrderBy(query.sort),
      toAdminOrderDto,
    );
    return page;
  }

  /** 단건 조회 — 상세가 별도 페이지라 목록 없이도 열린다 */
  async findOne(orderPublicId: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException(ErrorCode.ORDER_NOT_FOUND);
    return toAdminOrderDto(order);
  }

  /** 운영자 전이 — 단계 진행·환불 처리·재제작 승인 */
  async transitionAsAdmin(
    orderPublicId: string,
    toStatus: OrderStatus,
    adminNote?: string,
  ) {
    const order = await this.ordersShared.findOrderOrThrow(orderPublicId);
    const updated = await this.ordersShared.applyTransition(
      order,
      toStatus,
      ActorType.ADMIN,
      false,
      { adminNote },
    );
    return toAdminOrderDto(updated);
  }

  /**
   * 일괄 전이 — 선택한 주문을 같은 단계로. 개별 실패(전이 불가 등)는 건너뛰고
   * 결과에 담아 돌려주어, 한 건 때문에 전체가 막히지 않게 한다.
   */
  async bulkTransition(
    orderIds: string[],
    toStatus: OrderStatus,
    adminNote?: string,
  ) {
    const succeeded: string[] = [];
    const failed: { orderId: string; code: string }[] = [];
    for (const orderId of orderIds) {
      try {
        await this.transitionAsAdmin(orderId, toStatus, adminNote);
        succeeded.push(orderId);
      } catch (error) {
        failed.push({
          orderId,
          code:
            error instanceof HttpException
              ? String(
                  (error.getResponse() as { message?: string }).message ??
                    ErrorCode.UNKNOWN,
                )
              : ErrorCode.UNKNOWN,
        });
      }
    }
    return { succeeded, failed };
  }

  /** CSV 다운로드 — 화면과 같은 필터를 적용하고, BOM으로 엑셀 한글 호환. 페이지네이션은 없음 */
  async toCsv(query: AdminOrdersQuery) {
    const orders = await this.prisma.order.findMany({
      // ids가 오면 화면에서 고른 건만 — 없으면 현재 필터 전체
      where: query.ids?.length
        ? { publicId: { in: query.ids } }
        : toWhere(query),
      include: orderInclude,
      orderBy: toOrderBy(query.sort),
    });
    const header = [
      '주문번호',
      '주문일시',
      '클럽',
      '주문자',
      '문집 제목',
      '부수',
      '판형',
      '쪽수',
      '금액',
      '수록 책',
      '상태',
      '제작처 주문번호',
      '제작처 상태',
      '송장번호',
      '요청 사유',
      '사유 상세',
      '운영자 메모',
      '최근 변경일',
    ];
    const rows = orders.map((order) => {
      const lastChanged =
        order.history[order.history.length - 1]?.changedAt ?? order.createdAt;
      // 사유는 가장 최근의 환불·재제작 요청 이력에서 (D-025)
      const lastIssue = [...order.history]
        .reverse()
        .find((entry) => entry.reason);
      const lastNote = [...order.history]
        .reverse()
        .find((entry) => entry.adminNote);
      return [
        order.publicId,
        formatDateTime(order.createdAt),
        order.club.name,
        order.member.name,
        order.title,
        String(order.copies),
        findBookSpec(order.bookSpecUid)?.name ?? order.bookSpecUid,
        `${order.pageCount}쪽`,
        String(order.productAmount + order.shippingFee),
        order.books.map((ob) => ob.book.title).join(' / '),
        ORDER_STATUS_LABEL[order.status],
        order.vendorOrderUid ?? '',
        order.vendorStatus ?? '',
        order.trackingNumber ?? '',
        lastIssue?.reason ? ORDER_ISSUE_REASON_LABEL[lastIssue.reason] : '',
        lastIssue?.reasonDetail ?? '',
        lastNote?.adminNote ?? '',
        formatDateTime(lastChanged),
      ];
    });
    return (
      '﻿' +
      [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n')
    );
  }
}

const escapeCsv = (value: string) => {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
};

// 서버 로컬 TZ 무관하게 KST 고정 표기 (sv-SE 로케일 = YYYY-MM-DD HH:mm:ss)
const formatDateTime = (date: Date) =>
  date.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);

/** 주문에 '운영자가 진행할 수 있는 다음 단계'를 덧붙인다 (전이 맵 단일 소스 재사용) */
/** 운영자 처리가 필요한 상태 — 신규 접수와 주문자 요청 건 */
const ACTION_REQUIRED_STATUSES = [
  OrderStatus.RECEIVED,
  OrderStatus.REFUND_REQUESTED,
  OrderStatus.REMAKE_REQUESTED,
];

/** 화면 필터(상태·클럽·검색어·기간·처리대기)를 Prisma 조건으로 — 목록과 CSV가 같은 기준을 쓴다 */
const toWhere = (query: AdminOrdersQuery): Prisma.OrderWhereInput => {
  const keyword = query.q?.trim();
  // 종료일은 '당일 포함'이 자연스러우므로 다음 날 0시 직전까지
  const toDate = query.to ? new Date(query.to) : undefined;
  if (toDate) toDate.setDate(toDate.getDate() + 1);
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.actionRequired && !query.status
      ? { status: { in: ACTION_REQUIRED_STATUSES } }
      : {}),
    ...(query.clubId ? { club: { publicId: query.clubId } } : {}),
    ...(query.from || toDate
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(toDate ? { lt: toDate } : {}),
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' as const } },
            { publicId: { contains: keyword } },
            {
              member: {
                name: { contains: keyword, mode: 'insensitive' as const },
              },
            },
            // 클럽도 한 필드에서 — 클럽이 늘어날수록 드롭다운은 감당이 안 된다
            {
              club: {
                name: { contains: keyword, mode: 'insensitive' as const },
              },
            },
            { club: { publicId: { contains: keyword } } },
          ],
        }
      : {}),
  };
};

/** 정렬 옵션 → Prisma orderBy (주문일·변경일 × 최신·오래된순) */
const toOrderBy = (
  sort: AdminOrdersQuery['sort'],
): Prisma.OrderOrderByWithRelationInput => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'changed_latest':
      return { statusChangedAt: 'desc' };
    case 'changed_oldest':
      return { statusChangedAt: 'asc' };
    default:
      return { createdAt: 'desc' };
  }
};
