import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BooksModule } from './books/books.module';
import { ClubsModule } from './clubs/clubs.module';
import { CommentsModule } from './comments/comments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClubsModule, BooksModule, CommentsModule],
  controllers: [AppController],
})
export class AppModule {}
