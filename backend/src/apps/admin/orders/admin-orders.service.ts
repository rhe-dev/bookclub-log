import { Injectable } from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { PaginationQuery } from '../../../shared/dto/pagination.query';
import { orderInclude } from '../../../shared/orders/order.mapper';
import {
  ORDER_ISSUE_REASON_LABEL,
  ORDER_STATUS_LABEL,
} from './order-status-label';
import { OrdersSharedService } from '../../../shared/orders/orders-shared.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/** 운영자 관점의 주문 유스케이스 — 목록·단계 진행·CSV */
@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersShared: OrdersSharedService,
  ) {}

  listAll(query: PaginationQuery) {
    return this.ordersShared.paginate({}, query);
  }

  /** 운영자 전이 — 단계 진행·환불 처리·재제작 승인 */
  async transitionAsAdmin(orderPublicId: string, toStatus: OrderStatus) {
    const order = await this.ordersShared.findOrderOrThrow(orderPublicId);
    return this.ordersShared.applyTransition(
      order,
      toStatus,
      ActorType.ADMIN,
      false,
    );
  }

  /** CSV 다운로드 — 사용자 언어 라벨, BOM으로 엑셀 한글 호환. 전체 내보내기 용도라 페이지네이션 없음 */
  async toCsv() {
    const orders = await this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    const header = [
      '주문번호',
      '주문일',
      '클럽',
      '주문자',
      '문집 제목',
      '부수',
      '수록 책',
      '상태',
      '요청 사유',
      '사유 상세',
      '최근 변경일',
    ];
    const rows = orders.map((order) => {
      const lastChanged =
        order.history[order.history.length - 1]?.changedAt ?? order.createdAt;
      // 사유는 가장 최근의 환불·재제작 요청 이력에서 (D-025)
      const lastIssue = [...order.history]
        .reverse()
        .find((entry) => entry.reason);
      return [
        order.publicId,
        formatDateTime(order.createdAt),
        order.club.name,
        order.member.name,
        order.title,
        String(order.copies),
        order.books.map((ob) => ob.book.title).join(' / '),
        ORDER_STATUS_LABEL[order.status],
        lastIssue?.reason ? ORDER_ISSUE_REASON_LABEL[lastIssue.reason] : '',
        lastIssue?.reasonDetail ?? '',
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
