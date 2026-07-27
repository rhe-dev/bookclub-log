import { Module } from '@nestjs/common';
import { SharedOrdersModule } from '../../../shared/orders/shared-orders.module';
import { ClubsModule } from '../clubs/clubs.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ClubsModule, SharedOrdersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
