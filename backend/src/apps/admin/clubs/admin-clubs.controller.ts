import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminClubsService } from './admin-clubs.service';
import {
  AdminClubDetailResponse,
  AdminClubResponse,
} from './dto/admin-club.response';
import { AdminClubsQuery } from './dto/admin-clubs.query';
import { AdminNoteDto } from '../members/dto/admin-note.dto';
import { AdminNoteResponse } from '../members/dto/admin-member.response';

/** 운영자용 — 데모 범위상 별도 인증 없이 /admin 경로로만 분리 (D-003) */
@Controller('admin/clubs')
export class AdminClubsController {
  constructor(private readonly adminClubsService: AdminClubsService) {}

  /** 페이지네이션 예외 — 필터 드롭다운에 전부 보여야 하는 유한 목록 (D-026) */
  @Get()
  findAll(@Query() query: AdminClubsQuery): Promise<AdminClubResponse[]> {
    return this.adminClubsService.findAll(query);
  }

  @Get(':clubId')
  detail(@Param('clubId') clubId: string): Promise<AdminClubDetailResponse> {
    return this.adminClubsService.detail(clubId);
  }

  @Patch(':clubId/note')
  updateNote(
    @Param('clubId') clubId: string,
    @Body() dto: AdminNoteDto,
  ): Promise<AdminNoteResponse> {
    return this.adminClubsService.updateNote(clubId, dto.note);
  }
}
