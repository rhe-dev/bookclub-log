import { Controller, Get } from '@nestjs/common';
import { MemberAccountResponse } from './dto/member-account.response';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(): Promise<MemberAccountResponse[]> {
    return this.membersService.findAll();
  }
}
