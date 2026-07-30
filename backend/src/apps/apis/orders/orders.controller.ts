import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { PaginationQuery } from '../../../shared/dto/pagination.query';
import {
  OrderResponse,
  PaginatedOrdersResponse,
} from '../../../shared/orders/dto/order.response';
import { TransitionOrderDto } from './dto/transition-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { EstimateOrderDto } from './dto/estimate-order.dto';
import { OrderEstimateResponse } from './dto/order-estimate.response';
import { OrdersService } from './orders.service';

@ApiHeader({
  name: 'X-Member-Id',
  required: false,
  description: '현재 멤버의 publicId — 주문·전이 요청에 필요 (D-017)',
})
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 문집 견적 — 수록 책이 정해질 때마다 호출한다.
   * 목록 조회가 아니라 선택 목록을 본문으로 받는 계산이라 POST (벤더의 POST /orders/estimate와 동형)
   */
  @Post('clubs/:clubId/orders/estimate')
  estimate(
    @Param('clubId') clubId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: EstimateOrderDto,
  ): Promise<OrderEstimateResponse> {
    return this.ordersService.estimate(clubId, memberId, dto);
  }

  @Post('clubs/:clubId/orders')
  create(
    @Param('clubId') clubId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponse> {
    return this.ordersService.create(clubId, memberId, dto);
  }

  @Get('orders/mine')
  listMine(
    @Headers('x-member-id') memberId: string | undefined,
    @Query() query: PaginationQuery,
  ): Promise<PaginatedOrdersResponse> {
    return this.ordersService.listMine(memberId, query);
  }

  /** 주문자 전이 — 취소·구매 확정·환불/재제작 요청 */
  @Post('orders/:orderId/transition')
  transition(
    @Param('orderId') orderId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: TransitionOrderDto,
  ): Promise<OrderResponse> {
    return this.ordersService.transitionAsUser(orderId, memberId, dto);
  }
}
