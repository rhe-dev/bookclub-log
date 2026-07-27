'use client';

import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {
  Box,
  ButtonBase,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';
import { MemberAvatar } from '../ui/MemberAvatar';
import { Typo } from '../ui/Typo';
import { CommonContainer } from './CommonContainer';

/**
 * 공통 헤더 — 로고(책방 이동) + 현재 멤버 칩(멤버 변경 메뉴).
 * 반응형: 모바일 56px/데스크탑 64px, 모바일에서는 칩이 아바타만 남고
 * 이름·역할은 메뉴 상단에서 확인한다.
 */
export const Header = () => {
  const member = useMemberStore((s) => s.member);
  const clearMember = useMemberStore((s) => s.clearMember);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // GNB 구성: 현재 페이지명 + 홈으로 돌아가기(로고, 모바일은 ←) + 사용자 메뉴
  const pageTitle = getPageTitle(pathname);
  const showBack = Boolean(member) && pageTitle !== null;

  const handleChangeMember = () => {
    setAnchorEl(null);
    clearMember();
    router.push(ROUTES.entry);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showBack && (
            <IconButton
              aria-label="책방으로 돌아가기"
              onClick={() => router.push(ROUTES.bookshelf)}
              sx={{ ml: -1, display: { xs: 'inline-flex', md: 'none' } }}
            >
              <ArrowBackIosNewRoundedIcon
                sx={{ fontSize: 18, color: colorChips.grayScale[600] }}
              />
            </IconButton>
          )}
          <Box
            component={Link}
            href={member ? ROUTES.bookshelf : ROUTES.entry}
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
            {/* 서브 페이지는 현재 페이지명, 홈·입장은 서비스명(모바일은 로고만) */}
            <Typo
              token="text_b_18"
              color={colorChips.basic.black}
              sx={{
                fontSize: { xs: 16, md: 18 },
                whiteSpace: 'nowrap',
                display: pageTitle ? 'block' : { xs: 'none', sm: 'block' },
              }}
            >
              {pageTitle ?? '북클럽 로그'}
            </Typo>
          </Box>
        </Box>

        {member && (
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
                {member.role === 'LEADER' && (
                  <Typo token="text_m_12" color={colorChips.secondary[500]}>
                    모임장
                  </Typo>
                )}
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
              <Box sx={{ px: 2, py: 1 }}>
                <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                  {member.name}
                  {member.role === 'LEADER' && (
                    <Typo
                      component="span"
                      token="text_m_12"
                      color={colorChips.secondary[500]}
                      sx={{ ml: 0.75 }}
                    >
                      모임장
                    </Typo>
                  )}
                </Typo>
              </Box>
              <Divider />
              <MenuItem onClick={handleChangeMember}>멤버 변경</MenuItem>
            </Menu>
          </>
        )}
      </CommonContainer>
    </Box>
  );
};

const PAGE_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/books\//, title: '책 상세' },
  { pattern: /^\/orders\/new/, title: '문집 만들기' },
  { pattern: /^\/my/, title: '마이페이지' },
  { pattern: /^\/admin/, title: '주문 관리' },
];

/** 서브 페이지명 — 홈(책방)·입장은 null */
const getPageTitle = (pathname: string) =>
  PAGE_TITLES.find(({ pattern }) => pattern.test(pathname))?.title ?? null;
