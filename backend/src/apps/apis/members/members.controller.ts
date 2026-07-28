import { Controller, Get } from '@nestjs/common';
import { MemberAccountResponse } from './dto/member-account.response';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /** 페이지네이션 예외 — 계정 선택 모달에 전 계정이 보여야 하는 데모용 목록 (D-024) */
  @Get()
  findAll(): Promise<MemberAccountResponse[]> {
    return this.membersService.findAll();
  }
}
