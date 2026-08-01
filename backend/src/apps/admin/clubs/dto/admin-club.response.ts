import { ApiProperty } from '@nestjs/swagger';
import { ClubRole, OrderStatus } from '@prisma/client';

/** 운영자 모임 목록 한 줄 */
export class AdminClubResponse {
  publicId: string;
  name: string;
  description: string;
  createdAt: Date;
  memberCount: number;
  /** 삭제되지 않은 책 수 */
  bookCount: number;
  orderCount: number;
  hasAdminNote: boolean;
}

/** 모임 상세의 멤버 — 회원 상세로 이동 */
export class AdminClubMemberResponse {
  publicId: string;
  name: string;
  avatarEmoji: string;
  color: string;

  @ApiProperty({ enum: ClubRole })
  role: ClubRole;

  joinedAt: Date;
}

/** 모임 상세의 최근 주문 — 주문 상세로 이동 */
export class AdminClubOrderResponse {
  publicId: string;
  title: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  copies: number;
  createdAt: Date;
  memberName: string;
}

export class AdminClubDetailResponse {
  publicId: string;
  name: string;
  description: string;
  inviteCode: string;
  createdAt: Date;

  @ApiProperty({ nullable: true })
  adminNote: string | null;

  memberCount: number;
  /** 삭제되지 않은 책 수 */
  bookCount: number;
  orderCount: number;
  members: AdminClubMemberResponse[];
  recentOrders: AdminClubOrderResponse[];
}
