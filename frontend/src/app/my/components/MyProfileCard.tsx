'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Stack } from '@mui/material';
import { ClubRoleTag } from '@/shared/components/club/ClubRoleTag';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonListRow } from '@/shared/components/ui/CommonListRow';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { colorChips } from '@/shared/styles/colors';
import { cardSurface } from '@/shared/styles/mixins';
import type { MyClub } from '@/shared/types/club';
import type { MemberSummary } from '@/shared/types/member';

interface MyProfileCardProps {
  member: MemberSummary;
  clubs?: MyClub[];
  isError: boolean;
  onRetry: () => void;
  onSelectClub: (club: MyClub) => void;
  onLogout: () => void;
}

/** 마이페이지 프로필 카드 — 아바타·이름·로그아웃 + 가입 클럽(역할·이동) */
export const MyProfileCard = ({
  member,
  clubs,
  isError,
  onRetry,
  onSelectClub,
  onLogout,
}: MyProfileCardProps) => (
  <Box sx={cardSurface}>
    <Stack
      direction="row"
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <MemberAvatar
          color={member.color}
          emoji={member.avatarEmoji}
          size={48}
        />
        <Typo token="text_b_18" color={colorChips.grayScale[800]}>
          {member.name}
        </Typo>
      </Stack>
      <CommonButton
        label="로그아웃"
        size="small"
        buttonColor="tertiary"
        buttonVariant="outlined"
        onClick={onLogout}
      />
    </Stack>

    <VerticalGap size={16} />
    <Typo token="text_m_12" color={colorChips.grayScale[500]}>
      가입한 클럽
    </Typo>
    <VerticalGap size={8} />
    {/* 클럽 목록만 실패해도 프로필·활동 탭은 유지 */}
    {isError ? (
      <ErrorView message="클럽 목록을 불러오지 못했어요." onRetry={onRetry} />
    ) : (
      <Stack spacing={1}>
        {clubs?.map((club) => (
          <CommonListRow
            key={club.publicId}
            onClick={() => onSelectClub(club)}
            ariaLabel={`${club.name} 책방으로 이동`}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                {club.name}
              </Typo>
              <ClubRoleTag role={club.myRole} />
            </Stack>
            <ChevronRightRoundedIcon
              sx={{
                fontSize: 18,
                color: colorChips.grayScale[400],
                flexShrink: 0,
              }}
            />
          </CommonListRow>
        ))}
      </Stack>
    )}
  </Box>
);
