'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, ButtonBase, Divider, Menu, MenuItem, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminPendingCountQuery } from '@/shared/api/adminApi';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import { ClubRoleTag } from '@/shared/components/club/ClubRoleTag';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ROUTES } from '@/shared/constants/routes';
import { useAdminFilterStore } from '@/shared/stores/adminFilterStore';
import { useSessionActions } from '@/shared/hooks/useSessionActions';
import { useLoginModalStore } from '@/shared/stores/loginModalStore';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';
import type { MyClub } from '@/shared/types/club';
import { MemberAvatar } from '../ui/MemberAvatar';
import { Typo } from '../ui/Typo';
import { CommonContainer } from './CommonContainer';
import { LoginModal } from './LoginModal';

/** 로그인 후 사용 가능한 서비스가 GNB 메뉴 — 현재 위치는 활성 스타일로 표시 */
const MEMBER_NAV = [
  {
    label: '책방',
    href: ROUTES.bookshelf,
    // '/books'는 책 상세(ROUTES.bookDetail)의 프리픽스 — 책 상세도 책방 섹션
    prefixes: [ROUTES.bookshelf, '/books'],
  },
  { label: '문집 만들기', href: ROUTES.orderNew, prefixes: [ROUTES.orderNew] },
];

/** 목록 메뉴는 마지막으로 보던 필터를 쿼리로 달고 간다 */
const useWithLastQuery = () => {
  const lastQuery = useAdminFilterStore((s) => s.lastQuery);
  return (href: string) => {
    const query =
      href === ROUTES.adminOrders
        ? lastQuery.orders
        : href === ROUTES.adminMembers
          ? lastQuery.members
          : href === ROUTES.adminClubs
            ? lastQuery.clubs
            : '';
    return query ? `${href}?${query}` : href;
  };
};

/** 운영자 GNB — 서비스 메뉴와 배타적으로 노출 (D-029) */
const ADMIN_NAV = [
  {
    label: '주문 관리',
    href: ROUTES.adminOrders,
    prefixes: [ROUTES.adminOrders],
  },
  {
    label: '회원 관리',
    href: ROUTES.adminMembers,
    prefixes: [ROUTES.adminMembers],
  },
  {
    label: '클럽 관리',
    href: ROUTES.adminClubs,
    prefixes: [ROUTES.adminClubs],
  },
];

/**
 * 공통 헤더 — 로고(로그인 시 책방, 비로그인 시 서비스 소개) + 내비 메뉴(책방·문집 만들기)
 * + 멤버 메뉴(내 클럽 전환·마이페이지·로그아웃). 비로그인 시에는 로그인 버튼 (D-024).
 * 반응형: 모바일 56px/데스크탑 64px, 모바일은 로고·메뉴만 남고 이름은 멤버 메뉴 상단에서.
 */
export const Header = () => {
  const member = useMemberStore((s) => s.member);
  const club = useMemberStore((s) => s.club);
  const isAdmin = useMemberStore((s) => s.isAdmin);
  const { goClub, logout } = useSessionActions();
  // 운영자가 처리해야 할 건수 — 메뉴에 배지로 노출
  const pendingCountQuery = useAdminPendingCountQuery(isAdmin);
  const withLastQuery = useWithLastQuery();
  const openLoginModal = useLoginModalStore((s) => s.open);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const myClubsQuery = useMyClubsQuery(member?.publicId);

  const handleGoMyPage = () => {
    setAnchorEl(null);
    router.push(ROUTES.myPage);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  const handleSelectClub = (target: MyClub) => {
    setAnchorEl(null);
    goClub(target);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: colorChips.basic.white,
        borderBottom: `1px solid ${colorChips.grayScale[200]}`,
      }}
    >
      <CommonContainer
        direction="row"
        sx={{
          height: { xs: 56, md: 64 },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, md: 2 },
            minWidth: 0,
          }}
        >
          <Box
            component={Link}
            href={
              isAdmin
                ? ROUTES.adminOrders
                : member
                  ? ROUTES.bookshelf
                  : ROUTES.home
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Image
              src="/logo.svg"
              alt="북클럽 로그 로고"
              width={28}
              height={28}
              priority
            />
            {/* 모바일은 로고만 — 메뉴 공간 확보 */}
            <Typo
              token="text_b_18"
              color={colorChips.basic.black}
              sx={{
                fontSize: { xs: 16, md: 18 },
                whiteSpace: 'nowrap',
                display: { xs: 'none', md: 'block' },
              }}
            >
              북클럽 로그{isAdmin ? ' 운영' : ''}
            </Typo>
          </Box>

          {(member || isAdmin) && (
            <Stack direction="row" spacing={{ xs: 0.25, md: 0.5 }}>
              {(isAdmin ? ADMIN_NAV : MEMBER_NAV).map((item) => {
                const isActive = item.prefixes.some((prefix) =>
                  pathname.startsWith(prefix),
                );
                return (
                  <Box
                    key={item.href}
                    component={Link}
                    // 다른 메뉴에 갔다 돌아와도 보던 조건이 살아나게 — 필터는 URL에 있다
                    href={withLastQuery(item.href)}
                    sx={{
                      px: { xs: 1, md: 1.25 },
                      py: 0.75,
                      borderRadius: 1.5,
                      textDecoration: 'none',
                      '&:hover': { backgroundColor: colorChips.grayScale[100] },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <Typo
                        token={isActive ? 'text_sb_14' : 'text_m_14'}
                        color={
                          isActive
                            ? colorChips.primary[500]
                            : colorChips.grayScale[600]
                        }
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {item.label}
                      </Typo>
                      {item.href === ROUTES.adminOrders &&
                        (pendingCountQuery.data ?? 0) > 0 && (
                          <Box
                            sx={{
                              px: 0.75,
                              borderRadius: 999,
                              backgroundColor: colorChips.secondary[500],
                            }}
                          >
                            <Typo
                              token="text_sb_10"
                              color={colorChips.basic.white}
                            >
                              {pendingCountQuery.data}
                            </Typo>
                          </Box>
                        )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {isAdmin ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typo
              token="text_sb_14"
              color={colorChips.secondary[500]}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              운영자
            </Typo>
            <CommonButton
              label="로그아웃"
              size="small"
              buttonColor="tertiary"
              buttonVariant="outlined"
              onClick={logout}
            />
          </Stack>
        ) : member ? (
          <>
            <ButtonBase
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="멤버 메뉴 열기"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: { xs: 0.75, sm: 1.25 },
                py: 0.75,
                borderRadius: 999,
                '&:hover': { backgroundColor: colorChips.grayScale[100] },
              }}
            >
              <MemberAvatar
                color={member.color}
                emoji={member.avatarEmoji}
                size={{ xs: 30, md: 32 }}
              />
              {/* 모바일(xs)에서는 이름·역할 숨김 — 메뉴 상단에서 확인 */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                  {member.name}
                </Typo>
                {club && <ClubRoleTag role={club.role} />}
              </Box>
              <KeyboardArrowDownRoundedIcon
                sx={{ fontSize: 18, color: colorChips.grayScale[500] }}
              />
            </ButtonBase>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {/* 이름은 GNB에 없는 모바일에서만 — 역할은 클럽별로 다르므로 내 클럽 목록에서 확인 */}
              <Box sx={{ px: 2, py: 1, display: { xs: 'block', sm: 'none' } }}>
                <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                  {member.name}
                </Typo>
              </Box>
              <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
              <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                <Typo token="text_m_12" color={colorChips.grayScale[500]}>
                  내 클럽
                </Typo>
              </Box>
              {myClubsQuery.data?.map((c) => {
                const isCurrent = c.publicId === club?.publicId;
                return (
                  <MenuItem
                    key={c.publicId}
                    onClick={() => handleSelectClub(c)}
                    sx={{ gap: 1, justifyContent: 'space-between' }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                    >
                      <Typo
                        token={isCurrent ? 'text_sb_14' : 'text_r_14'}
                        color={colorChips.grayScale[800]}
                      >
                        {c.name}
                      </Typo>
                      <ClubRoleTag role={c.myRole} />
                    </Box>
                    {isCurrent && (
                      <CheckRoundedIcon
                        sx={{ fontSize: 16, color: colorChips.primary[500] }}
                      />
                    )}
                  </MenuItem>
                );
              })}
              <Divider />
              <MenuItem onClick={handleGoMyPage}>마이페이지</MenuItem>
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          </>
        ) : (
          <CommonButton
            label="로그인"
            size="small"
            buttonVariant="outlined"
            onClick={openLoginModal}
          />
        )}
      </CommonContainer>
      <LoginModal />
    </Box>
  );
};
