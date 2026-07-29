import { Module } from '@nestjs/common';
import { AdminClubsController } from './admin-clubs.controller';
import { AdminClubsService } from './admin-clubs.service';

@Module({
  controllers: [AdminClubsController],
  providers: [AdminClubsService],
})
export class AdminClubsModule {}
