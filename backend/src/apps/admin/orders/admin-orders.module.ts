import { Module } from '@nestjs/common';
import { SharedOrdersModule } from '../../../shared/orders/shared-orders.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductionService } from './admin-production.service';

@Module({
  imports: [SharedOrdersModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, AdminProductionService],
})
export class AdminOrdersModule {}
