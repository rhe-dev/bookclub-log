import { Module } from '@nestjs/common';
import { AdminClubsModule } from './clubs/admin-clubs.module';
import { AdminMembersModule } from './members/admin-members.module';
import { AdminOrdersModule } from './orders/admin-orders.module';

/** 운영자 앱 — 주문·모임·회원 관리. 서버 분리를 가정한 경계 (D-023) */
@Module({
  imports: [AdminOrdersModule, AdminClubsModule, AdminMembersModule],
})
export class AdminModule {}
