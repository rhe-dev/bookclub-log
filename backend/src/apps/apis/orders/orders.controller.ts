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
import { TransitionOrderDto } from '../../../shared/orders/dto/transition-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiHeader({
  name: 'X-Member-Id',
  required: false,
  description: '현재 멤버의 publicId — 주문·전이 요청에 필요 (D-017)',
})
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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

  @Get('orders/:orderId')
  getOne(@Param('orderId') orderId: string): Promise<OrderResponse> {
    return this.ordersService.getOne(orderId);
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
