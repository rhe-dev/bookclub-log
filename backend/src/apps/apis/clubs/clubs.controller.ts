import { Controller, Get, Param } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubMemberResponse, ClubResponse } from './dto/club.response';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll(): Promise<ClubResponse[]> {
    return this.clubsService.findAll();
  }

  @Get(':clubId/members')
  findMembers(@Param('clubId') clubId: string): Promise<ClubMemberResponse[]> {
    return this.clubsService.findMembers(clubId);
  }
}
