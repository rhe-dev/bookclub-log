import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/** 운영자 관점의 클럽 조회 — 필터 드롭다운·회원 관리에서 사용 */
@Injectable()
export class AdminClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const clubs = await this.prisma.club.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return clubs.map((club) => ({
      publicId: club.publicId,
      name: club.name,
      memberCount: club._count.members,
    }));
  }
}
