import { ApiProperty } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';
import { MemberSummaryResponse } from '../../shared/dto/member-summary.response';
import { PageMetaResponse } from '../../shared/dto/page-meta.response';

export class BookResponse {
  publicId: string;
  title: string;
  author: string;
  publisher: string | null;
  coverColor: string;
  coverEmoji: string;

  @ApiProperty({ enum: BookStatus })
  status: BookStatus;

  meetingDate: Date | null;
  periodFrom: Date | null;
  periodTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  participants: MemberSummaryResponse[];
  commentCount: number;
}

export class PaginatedBooksResponse {
  items: BookResponse[];
  meta: PageMetaResponse;
}
