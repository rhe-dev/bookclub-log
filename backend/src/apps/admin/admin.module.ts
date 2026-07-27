import { Module } from '@nestjs/common';
import { AdminOrdersModule } from './orders/admin-orders.module';

/** 운영자 앱 — 주문 관리. 서버 분리를 가정한 경계 (D-023) */
@Module({
  imports: [AdminOrdersModule],
})
export class AdminModule {}
