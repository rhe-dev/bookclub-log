import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import {
  ClubMemberResponse,
  ClubResponse,
  MyClubResponse,
} from './dto/club.response';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll(): Promise<ClubResponse[]> {
    return this.clubsService.findAll();
  }

  /** 내가 가입한 클럽 목록 — GNB 클럽 변경·마이페이지 프로필용 */
  @Get('mine')
  findMine(
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<MyClubResponse[]> {
    return this.clubsService.findMine(memberId);
  }

  @Get(':clubId/members')
  findMembers(@Param('clubId') clubId: string): Promise<ClubMemberResponse[]> {
    return this.clubsService.findMembers(clubId);
  }
}
