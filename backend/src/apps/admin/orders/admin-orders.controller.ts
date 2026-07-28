import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiProduces, ApiResponse } from '@nestjs/swagger';
import { PaginationQuery } from '../../../shared/dto/pagination.query';
import {
  OrderResponse,
  PaginatedOrdersResponse,
} from '../../../shared/orders/dto/order.response';
import { AdminTransitionOrderDto } from './dto/admin-transition-order.dto';
import { AdminOrdersService } from './admin-orders.service';

/** 운영자용 — 데모 범위상 별도 인증 없이 /admin 경로로만 분리 (D-003) */
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  listAll(@Query() query: PaginationQuery): Promise<PaginatedOrdersResponse> {
    return this.adminOrdersService.listAll(query);
  }

  @Get('csv')
  @ApiProduces('text/csv')
  @ApiResponse({
    status: 200,
    description: '주문 전체 CSV (BOM 포함)',
    schema: { type: 'string' },
  })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  csv(): Promise<string> {
    return this.adminOrdersService.toCsv();
  }

  /** 운영자 전이 — 단계 진행·환불 처리·재제작 승인 */
  @Post(':orderId/transition')
  transition(
    @Param('orderId') orderId: string,
    @Body() dto: AdminTransitionOrderDto,
  ): Promise<OrderResponse> {
    return this.adminOrdersService.transitionAsAdmin(orderId, dto.toStatus);
  }
}
