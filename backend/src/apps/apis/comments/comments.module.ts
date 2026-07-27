import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { ClubsModule } from '../clubs/clubs.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [ClubsModule, BooksModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
