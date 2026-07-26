import { Controller, Get, Param } from '@nestjs/common';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':clubId/members')
  findMembers(@Param('clubId') clubId: string) {
    return this.clubsService.findMembers(clubId);
  }
}
