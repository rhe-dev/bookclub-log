import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../../../shared/constants/error-code';
import { toPageMeta } from '../../../shared/dto/pagination.query';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AdminMembersQuery } from './dto/admin-members.query';

/**
 * 운영자 관점의 회원 조회 (D-030 개정).
 *
 * 회원은 **조회만** 한다 — 상태를 바꾸거나 지우지 않는다. 이 서비스의 비즈니스 로직은
 * 문집 주문 한 축에 모으고, 회원·모임은 주문을 이해하기 위한 참조 화면으로 둔다.
 * 운영자가 남길 수 있는 건 응대 기록인 메모뿐이다.
 */
@Injectable()
export class AdminMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminMembersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = toWhere(query);

    const [totalCount, members] = await this.prisma.$transaction([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        include: {
          memberships: {
            include: { club: { select: { publicId: true, name: true } } },
            orderBy: { joinedAt: 'asc' },
          },
          _count: { select: { comments: true, orders: true } },
        },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: members.map((member) => ({
        publicId: member.publicId,
        name: member.name,
        avatarEmoji: member.avatarEmoji,
        color: member.color,
        createdAt: member.createdAt,
        clubs: member.memberships.map(({ club, role, joinedAt }) => ({
          publicId: club.publicId,
          name: club.name,
          role,
          joinedAt,
        })),
        commentCount: member._count.comments,
        orderCount: member._count.orders,
        hasAdminNote: Boolean(member.adminNote),
      })),
      meta: toPageMeta(page, limit, totalCount),
    };
  }

  /** 회원 상세 — 가입 모임·활동 요약 + 최근 주문 (주문 상세로 넘어가는 진입점) */
  async detail(memberPublicId: string) {
    const member = await this.prisma.member.findUnique({
      where: { publicId: memberPublicId },
      include: {
        memberships: {
          include: { club: { select: { publicId: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        orders: {
          include: { club: { select: { publicId: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { comments: true, orders: true, commentLikes: true },
        },
      },
    });
    if (!member) throw new NotFoundException(ErrorCode.MEMBER_NOT_FOUND);

    return {
      publicId: member.publicId,
      name: member.name,
      avatarEmoji: member.avatarEmoji,
      color: member.color,
      createdAt: member.createdAt,
      adminNote: member.adminNote,
      clubs: member.memberships.map(({ club, role, joinedAt }) => ({
        publicId: club.publicId,
        name: club.name,
        role,
        joinedAt,
      })),
      commentCount: member._count.comments,
      likeCount: member._count.commentLikes,
      orderCount: member._count.orders,
      recentOrders: member.orders.map((order) => ({
        publicId: order.publicId,
        title: order.title,
        status: order.status,
        copies: order.copies,
        createdAt: order.createdAt,
        clubName: order.club.name,
      })),
    };
  }

  async updateNote(memberPublicId: string, note?: string) {
    const member = await this.prisma.member.findUnique({
      where: { publicId: memberPublicId },
      select: { id: true },
    });
    if (!member) throw new NotFoundException(ErrorCode.MEMBER_NOT_FOUND);

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      // 빈 문자열은 '메모 없음'으로 — 지우기와 저장을 같은 동작으로 다룬다
      data: { adminNote: note?.trim() || null },
      select: { adminNote: true },
    });
    return { adminNote: updated.adminNote };
  }
}

function toWhere(query: AdminMembersQuery): Prisma.MemberWhereInput {
  const keyword = query.q?.trim();
  return {
    ...(query.clubId && {
      memberships: { some: { club: { publicId: query.clubId } } },
    }),
    // 이름·회원 ID·모임명을 한 필드로 — 모임이 늘어날수록 드롭다운은 감당이 안 된다
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { publicId: { contains: keyword } },
        {
          memberships: {
            some: {
              OR: [
                { club: { name: { contains: keyword, mode: 'insensitive' } } },
                { club: { publicId: { contains: keyword } } },
              ],
            },
          },
        },
      ],
    }),
    // 가입일 범위 — to는 그날 끝까지 포함해야 사용자가 고른 날짜가 빠지지 않는다
    ...((query.from || query.to) && {
      createdAt: {
        ...(query.from && { gte: new Date(`${query.from}T00:00:00`) }),
        ...(query.to && { lte: new Date(`${query.to}T23:59:59.999`) }),
      },
    }),
  };
}
