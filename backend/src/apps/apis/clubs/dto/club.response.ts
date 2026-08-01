import { ApiProperty } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

/** 내가 가입한 모임 — 모임별 내 역할 포함 */
export class MyClubResponse {
  publicId: string;
  name: string;
  description: string;
  memberCount: number;

  @ApiProperty({ enum: ClubRole })
  myRole: ClubRole;

  joinedAt: Date;
}

export class ClubMemberResponse {
  publicId: string;
  name: string;
  avatarEmoji: string;
  color: string;

  @ApiProperty({ enum: ClubRole })
  role: ClubRole;

  joinedAt: Date;
}
