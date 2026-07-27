import { ApiProperty } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

export class ClubResponse {
  publicId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
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
