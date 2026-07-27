import { Module } from '@nestjs/common';
import { OrdersSharedService } from './orders-shared.service';

@Module({
  providers: [OrdersSharedService],
  exports: [OrdersSharedService],
})
export class SharedOrdersModule {}
