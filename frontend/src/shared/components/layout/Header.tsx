'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, ButtonBase, Divider, Menu, MenuItem, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import { ClubRoleTag } from '@/shared/components/club/ClubRoleTag';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ROUTES } from '@/shared/constants/routes';
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
const NAV_ITEMS = [
  {
    label: '책방',
    href: ROUTES.bookshelf,
    // '/books'는 책 상세(ROUTES.bookDetail)의 프리픽스 — 책 상세도 책방 섹션
    prefixes: [ROUTES.bookshelf, '/books'],
  },
  { label: '문집 만들기', href: ROUTES.orderNew, prefixes: [ROUTES.orderNew] },
];

/**
 * 공통 헤더 — 로고(로그인 시 책방, 비로그인 시 서비스 소개) + 내비 메뉴(책방·문집 만들기)
 * + 멤버 메뉴(내 클럽 전환·마이페이지·로그아웃). 비로그인 시에는 로그인 버튼 (D-024).
 * 반응형: 모바일 56px/데스크탑 64px, 모바일은 로고·메뉴만 남고 이름은 멤버 메뉴 상단에서.
 */
export const Header = () => {
  const member = useMemberStore((s) => s.member);
  const club = useMemberStore((s) => s.club);
  const { goClub, logout } = useSessionActions();
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
            href={member ? ROUTES.bookshelf : ROUTES.home}
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
              북클럽 로그
            </Typo>
          </Box>

          {member && (
            <Stack direction="row" spacing={{ xs: 0.25, md: 0.5 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = item.prefixes.some((prefix) =>
                  pathname.startsWith(prefix),
                );
                return (
                  <Box
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      px: { xs: 1, md: 1.25 },
                      py: 0.75,
                      borderRadius: 1.5,
                      textDecoration: 'none',
                      '&:hover': { backgroundColor: colorChips.grayScale[100] },
                    }}
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
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {member ? (
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
