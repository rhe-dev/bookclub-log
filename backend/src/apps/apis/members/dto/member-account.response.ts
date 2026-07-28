import { ApiProperty } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

export class MemberAccountClubResponse {
  publicId: string;
  name: string;

  @ApiProperty({ enum: ClubRole })
  role: ClubRole;
}

/** 로그인(계정 선택) 모달용 회원 계정 — 가입 클럽·역할 포함 (D-017 무인증 데모) */
export class MemberAccountResponse {
  publicId: string;
  name: string;
  avatarEmoji: string;
  color: string;
  clubs: MemberAccountClubResponse[];
}
