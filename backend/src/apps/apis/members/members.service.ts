import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 전체 회원 계정 목록 — 로그인 모달의 계정 선택용 */
  async findAll() {
    const members = await this.prisma.member.findMany({
      orderBy: { id: 'asc' },
      include: {
        memberships: {
          include: { club: { select: { publicId: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    return members.map((member) => ({
      publicId: member.publicId,
      name: member.name,
      avatarEmoji: member.avatarEmoji,
      color: member.color,
      clubs: member.memberships.map(({ club, role }) => ({
        publicId: club.publicId,
        name: club.name,
        role,
      })),
    }));
  }
}
