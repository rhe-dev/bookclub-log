import { ApiProperty } from '@nestjs/swagger';
import { ClubRole, OrderStatus } from '@prisma/client';
import { PageMetaResponse } from '../../../../shared/dto/page-meta.response';

/** 회원이 가입한 모임 — 모임 상세로 넘어가는 진입점 */
export class AdminMemberClubResponse {
  publicId: string;
  name: string;

  @ApiProperty({ enum: ClubRole })
  role: ClubRole;

  joinedAt: Date;
}

/** 목록 한 줄 */
export class AdminMemberResponse {
  publicId: string;
  name: string;
  avatarEmoji: string;
  color: string;
  createdAt: Date;
  clubs: AdminMemberClubResponse[];
  commentCount: number;
  orderCount: number;
  /** 메모가 있는 회원은 목록에서 표시해 응대 이력이 있음을 알린다 */
  hasAdminNote: boolean;
}

export class PaginatedAdminMembersResponse {
  items: AdminMemberResponse[];
  meta: PageMetaResponse;
}

/** 회원 상세의 최근 주문 — 주문 상세로 이동 */
export class AdminMemberOrderResponse {
  publicId: string;
  title: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  copies: number;
  createdAt: Date;
  clubName: string;
}

export class AdminMemberDetailResponse {
  publicId: string;
  name: string;
  avatarEmoji: string;
  color: string;
  createdAt: Date;

  @ApiProperty({ nullable: true })
  adminNote: string | null;

  clubs: AdminMemberClubResponse[];
  commentCount: number;
  likeCount: number;
  orderCount: number;
  recentOrders: AdminMemberOrderResponse[];
}

/** 메모 수정 응답 */
export class AdminNoteResponse {
  @ApiProperty({ nullable: true })
  adminNote: string | null;
}
