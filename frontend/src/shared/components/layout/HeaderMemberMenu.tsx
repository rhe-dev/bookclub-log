'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import { ClubRoleTag } from '@/shared/components/club/ClubRoleTag';
import { colorChips } from '@/shared/styles/colors';
import type { MyClub } from '@/shared/types/club';
import { Typo } from '../ui/Typo';

interface HeaderMemberMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  /** 이름은 GNB에 없는 모바일에서만 노출 */
  memberName: string;
  /** 내 모임 목록은 헤더에서 미리 받아 둔다 — 메뉴를 열 때 항목이 늦게 차면 높이가 튄다 */
  myClubs: MyClub[] | undefined;
  currentClubId: string | undefined;
  onSelectClub: (club: MyClub) => void;
  onGoMyPage: () => void;
  onLogout: () => void;
}

/**
 * 멤버 메뉴 팝업 — 내 모임 전환 · 마이페이지 · 로그아웃.
 *
 * 헤더에서 분리해 지연 로딩한다. Menu는 Popover·Modal·List를 끌고 오는데,
 * 아바타를 눌러야 열리는 화면이라 첫 로드에 있을 이유가 없다.
 */
export const HeaderMemberMenu = ({
  anchorEl,
  onClose,
  memberName,
  myClubs,
  currentClubId,
  onSelectClub,
  onGoMyPage,
  onLogout,
}: HeaderMemberMenuProps) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* 이름은 GNB에 없는 모바일에서만 — 역할은 모임별로 다르므로 내 모임 목록에서 확인 */}
      <Box sx={{ px: 2, py: 1, display: { xs: 'block', sm: 'none' } }}>
        <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
          {memberName}
        </Typo>
      </Box>
      <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
      <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
        <Typo token="text_m_12" color={colorChips.grayScale[500]}>
          내 모임
        </Typo>
      </Box>
      {myClubs?.map((c) => {
        const isCurrent = c.publicId === currentClubId;
        return (
          <MenuItem
            key={c.publicId}
            onClick={() => onSelectClub(c)}
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
      <MenuItem onClick={onGoMyPage}>마이페이지</MenuItem>
      <MenuItem onClick={onLogout}>로그아웃</MenuItem>
    </Menu>
  );
};
