import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { ClubsModule } from './clubs/clubs.module';
import { CommentsModule } from './comments/comments.module';
import { MembersModule } from './members/members.module';
import { OrdersModule } from './orders/orders.module';

/** 서비스(모임 멤버) 앱 — 책방·토론·주문 */
@Module({
  imports: [
    MembersModule,
    ClubsModule,
    BooksModule,
    CommentsModule,
    OrdersModule,
  ],
})
export class ApisModule {}
