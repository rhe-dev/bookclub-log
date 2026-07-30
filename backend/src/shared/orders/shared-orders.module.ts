import { Module } from '@nestjs/common';
import { ManuscriptService } from './manuscript.service';
import { OrdersSharedService } from './orders-shared.service';

@Module({
  providers: [OrdersSharedService, ManuscriptService],
  exports: [OrdersSharedService, ManuscriptService],
})
export class SharedOrdersModule {}
