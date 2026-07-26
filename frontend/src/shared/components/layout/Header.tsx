'use client';

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {
  Box,
  ButtonBase,
  Container,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';
import { Typo } from '../ui/Typo';

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
      <Container
        maxWidth="lg"
        sx={{
          height: { xs: 56, md: 64 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
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
          <Typo
            token="text_b_18"
            color={colorChips.basic.black}
            sx={{ fontSize: { xs: 16, md: 18 } }}
          >
            북클럽 로그
          </Typo>
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
              <Box
                sx={{
                  width: { xs: 30, md: 32 },
                  height: { xs: 30, md: 32 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  backgroundColor: member.color,
                }}
              >
                {member.avatarEmoji}
              </Box>
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
      </Container>
    </Box>
  );
};
