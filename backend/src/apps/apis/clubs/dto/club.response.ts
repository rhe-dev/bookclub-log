import { ApiProperty } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

export class ClubResponse {
  publicId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
}

/** 내가 가입한 클럽 — 클럽별 내 역할 포함 */
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
