import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminMembersService } from './admin-members.service';
import {
  AdminMemberDetailResponse,
  AdminNoteResponse,
  PaginatedAdminMembersResponse,
} from './dto/admin-member.response';
import { AdminMembersQuery } from './dto/admin-members.query';
import { AdminNoteDto } from './dto/admin-note.dto';

/** 운영자용 — 회원은 조회 + 메모만 (D-030) */
@Controller('admin/members')
export class AdminMembersController {
  constructor(private readonly adminMembersService: AdminMembersService) {}

  @Get()
  list(
    @Query() query: AdminMembersQuery,
  ): Promise<PaginatedAdminMembersResponse> {
    return this.adminMembersService.list(query);
  }

  @Get(':memberId')
  detail(
    @Param('memberId') memberId: string,
  ): Promise<AdminMemberDetailResponse> {
    return this.adminMembersService.detail(memberId);
  }

  @Patch(':memberId/note')
  updateNote(
    @Param('memberId') memberId: string,
    @Body() dto: AdminNoteDto,
  ): Promise<AdminNoteResponse> {
    return this.adminMembersService.updateNote(memberId, dto.note);
  }
}
