import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../../shared/constants/error-code';
import { AdminClubsQuery } from './dto/admin-clubs.query';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * 운영자 관점의 모임 조회 (D-030 개정).
 * 모임도 조회만 한다 — 목록 화면은 두지 않고, 주문·회원 상세에서 링크로 들어온다.
 */
@Injectable()
export class AdminClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminClubsQuery = {}) {
    const keyword = query.q?.trim();
    const clubs = await this.prisma.club.findMany({
      where: {
        ...(keyword && {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { publicId: { contains: keyword } },
          ],
        }),
        // 개설일 범위 — to는 그날 끝까지 포함
        ...((query.from || query.to) && {
          createdAt: {
            ...(query.from && { gte: new Date(`${query.from}T00:00:00`) }),
            ...(query.to && { lte: new Date(`${query.to}T23:59:59.999`) }),
          },
        }),
      },
      include: { _count: { select: { members: true, orders: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // 삭제된 책은 빼고 센다 — 소프트 딜리트라 _count에는 남는다
    const bookCounts = await this.prisma.book.groupBy({
      by: ['clubId'],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    const bookCountByClubId = new Map(
      bookCounts.map((row) => [row.clubId, row._count._all]),
    );

    return clubs.map((club) => ({
      publicId: club.publicId,
      name: club.name,
      description: club.description,
      createdAt: club.createdAt,
      memberCount: club._count.members,
      bookCount: bookCountByClubId.get(club.id) ?? 0,
      orderCount: club._count.orders,
      hasAdminNote: Boolean(club.adminNote),
    }));
  }

  /** 모임 상세 — 멤버·책·주문 요약 + 최근 주문 (주문 상세로 넘어가는 진입점) */
  async detail(clubPublicId: string) {
    const club = await this.prisma.club.findUnique({
      where: { publicId: clubPublicId },
      include: {
        members: {
          include: {
            member: {
              select: {
                publicId: true,
                name: true,
                avatarEmoji: true,
                color: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        orders: {
          include: { member: { select: { publicId: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { members: true, books: true, orders: true } },
      },
    });
    if (!club) throw new NotFoundException(ErrorCode.CLUB_NOT_FOUND);

    // 삭제된 책은 요약에서 제외 — 소프트 딜리트라 _count에는 남는다
    const bookCount = await this.prisma.book.count({
      where: { clubId: club.id, deletedAt: null },
    });

    return {
      publicId: club.publicId,
      name: club.name,
      description: club.description,
      inviteCode: club.inviteCode,
      createdAt: club.createdAt,
      adminNote: club.adminNote,
      memberCount: club._count.members,
      bookCount,
      orderCount: club._count.orders,
      members: club.members.map(({ member, role, joinedAt }) => ({
        publicId: member.publicId,
        name: member.name,
        avatarEmoji: member.avatarEmoji,
        color: member.color,
        role,
        joinedAt,
      })),
      recentOrders: club.orders.map((order) => ({
        publicId: order.publicId,
        title: order.title,
        status: order.status,
        copies: order.copies,
        createdAt: order.createdAt,
        memberName: order.member.name,
      })),
    };
  }

  async updateNote(clubPublicId: string, note?: string) {
    const club = await this.prisma.club.findUnique({
      where: { publicId: clubPublicId },
      select: { id: true },
    });
    if (!club) throw new NotFoundException(ErrorCode.CLUB_NOT_FOUND);

    const updated = await this.prisma.club.update({
      where: { id: club.id },
      data: { adminNote: note?.trim() || null },
      select: { adminNote: true },
    });
    return { adminNote: updated.adminNote };
  }
}
