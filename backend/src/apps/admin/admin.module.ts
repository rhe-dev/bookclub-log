import { Module } from '@nestjs/common';
import { AdminClubsModule } from './clubs/admin-clubs.module';
import { AdminOrdersModule } from './orders/admin-orders.module';

/** 운영자 앱 — 주문·클럽·회원 관리. 서버 분리를 가정한 경계 (D-023) */
@Module({
  imports: [AdminOrdersModule, AdminClubsModule],
})
export class AdminModule {}
