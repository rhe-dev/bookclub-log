import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubRole } from '@prisma/client';
import { ErrorMessage } from '../../../shared/constants/error-message';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const clubs = await this.prisma.club.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { id: 'asc' },
    });
    return clubs.map((club) => ({
      publicId: club.publicId,
      name: club.name,
      description: club.description,
      memberCount: club._count.members,
      createdAt: club.createdAt,
    }));
  }

  /** 멤버가 가입한 클럽 + 클럽별 역할 — 역할은 클럽마다 다를 수 있다 */
  async findMine(memberPublicId?: string) {
    const member = await this.getMemberOrThrow(memberPublicId);
    const memberships = await this.prisma.clubMember.findMany({
      where: { memberId: member.id },
      include: {
        club: { include: { _count: { select: { members: true } } } },
      },
      orderBy: { joinedAt: 'asc' },
    });
    return memberships.map(({ club, role, joinedAt }) => ({
      publicId: club.publicId,
      name: club.name,
      description: club.description,
      memberCount: club._count.members,
      myRole: role,
      joinedAt,
    }));
  }

  async findMembers(clubPublicId: string) {
    const club = await this.getClubOrThrow(clubPublicId);
    const memberships = await this.prisma.clubMember.findMany({
      where: { clubId: club.id },
      include: { member: true },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });
    return memberships.map(({ member, role, joinedAt }) => ({
      publicId: member.publicId,
      name: member.name,
      avatarEmoji: member.avatarEmoji,
      color: member.color,
      role,
      joinedAt,
    }));
  }

  async getClubOrThrow(publicId: string) {
    const club = await this.prisma.club.findUnique({ where: { publicId } });
    if (!club) throw new NotFoundException(ErrorMessage.CLUB_NOT_FOUND);
    return club;
  }

  // 무인증 환경의 현재 멤버 식별 — X-Member-Id 헤더의 publicId 사용 (D-017)
  async getMemberOrThrow(memberPublicId?: string) {
    if (!memberPublicId)
      throw new BadRequestException(ErrorMessage.MEMBER_HEADER_REQUIRED);
    const member = await this.prisma.member.findUnique({
      where: { publicId: memberPublicId },
    });
    if (!member) throw new NotFoundException(ErrorMessage.MEMBER_NOT_FOUND);
    return member;
  }

  async getMembershipOrThrow(clubId: number, memberPublicId?: string) {
    const member = await this.getMemberOrThrow(memberPublicId);
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_memberId: { clubId, memberId: member.id } },
    });
    if (!membership)
      throw new ForbiddenException(ErrorMessage.CLUB_MEMBER_ONLY);
    return { member, membership };
  }

  async assertLeader(clubId: number, memberPublicId?: string) {
    const { member, membership } = await this.getMembershipOrThrow(
      clubId,
      memberPublicId,
    );
    if (membership.role !== ClubRole.LEADER)
      throw new ForbiddenException(ErrorMessage.LEADER_ONLY);
    return member;
  }
}
