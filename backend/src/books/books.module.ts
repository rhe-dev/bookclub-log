import { Module } from '@nestjs/common';
import { ClubsModule } from '../clubs/clubs.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [ClubsModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
