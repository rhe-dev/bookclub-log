import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiProduces, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  AdminOrderResponse,
  PaginatedAdminOrdersResponse,
} from './dto/admin-order.response';
import { AdminOrdersQuery } from './dto/admin-orders.query';
import {
  AdminBulkTransitionDto,
  AdminTransitionOrderDto,
} from './dto/admin-transition-order.dto';
import { AdminOrdersService } from './admin-orders.service';

/** 운영자용 — 데모 범위상 별도 인증 없이 /admin 경로로만 분리 (D-003) */
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  listAll(
    @Query() query: AdminOrdersQuery,
  ): Promise<PaginatedAdminOrdersResponse> {
    return this.adminOrdersService.listAll(query);
  }

  @Get('csv')
  @ApiProduces('text/csv')
  @ApiResponse({
    status: 200,
    description: '주문 전체 CSV (BOM 포함)',
    schema: { type: 'string' },
  })
  async csv(
    @Query() query: AdminOrdersQuery,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    // 파일명에 적용된 필터와 내려받은 날짜를 남겨 여러 번 받아도 구분되게
    const today = new Date()
      .toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
      .replace(/-/g, '');
    // 무엇을 받은 파일인지 이름만 봐도 알 수 있게 — 범위 + 적용 필터 + 날짜
    const count = query.ids?.length ?? 0;
    const parts =
      query.scope === 'selected'
        ? ['orders', `selected${count}`]
        : query.scope === 'page'
          ? ['orders', `page${count}`]
          : ['orders', query.status ?? 'all'];
    if (!query.scope) {
      if (query.clubId) parts.push('club');
      if (query.q?.trim()) parts.push('search');
      if (query.actionRequired) parts.push('pending');
      if (query.from || query.to) parts.push('period');
    }
    const filename = `${parts.join('_')}_${today}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return this.adminOrdersService.toCsv(query);
  }

  /** 운영자 전이 — 단계 진행·환불 처리·재제작 승인 */
  @Post(':orderId/transition')
  transition(
    @Param('orderId') orderId: string,
    @Body() dto: AdminTransitionOrderDto,
  ): Promise<AdminOrderResponse> {
    return this.adminOrdersService.transitionAsAdmin(
      orderId,
      dto.toStatus,
      dto.adminNote,
    );
  }

  /** 일괄 전이 — 선택한 주문을 같은 단계로, 실패 건은 결과로 돌려준다 */
  @Post('bulk-transition')
  bulkTransition(@Body() dto: AdminBulkTransitionDto) {
    return this.adminOrdersService.bulkTransition(
      dto.orderIds,
      dto.toStatus,
      dto.adminNote,
    );
  }
}
