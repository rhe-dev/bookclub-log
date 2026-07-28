import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { ClubMemberResponse, MyClubResponse } from './dto/club.response';

@ApiHeader({
  name: 'X-Member-Id',
  required: false,
  description: '현재 멤버의 publicId — /clubs/mine에는 필수 (D-017)',
})
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  /**
   * 내가 가입한 클럽 목록 — GNB 클럽 전환·마이페이지 프로필용.
   * 페이지네이션 기본 규칙의 의도적 예외 — 드롭다운에 전부 보여야 하는 유한 목록
   */
  @Get('mine')
  findMine(
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<MyClubResponse[]> {
    return this.clubsService.findMine(memberId);
  }

  /** 페이지네이션 예외 — 프로필 그리드·참여자 선택에 전원이 보여야 하는 유한 목록 */
  @Get(':clubId/members')
  findMembers(@Param('clubId') clubId: string): Promise<ClubMemberResponse[]> {
    return this.clubsService.findMembers(clubId);
  }
}
