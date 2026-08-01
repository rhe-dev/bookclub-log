import { Box } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import type { ClubRole } from '@/shared/types/club';

/** 모임 내 역할 태그 — 역할은 모임마다 다르므로 항상 모임명 옆에 붙여 쓴다 (D-024) */
export const ClubRoleTag = ({ role }: { role: ClubRole }) => {
  const isLeader = role === 'LEADER';
  return (
    <Box
      sx={{
        px: 0.6,
        py: 0.2,
        borderRadius: 999,
        flexShrink: 0,
        backgroundColor: isLeader
          ? colorChips.secondary[100]
          : colorChips.grayScale[100],
      }}
    >
      <Typo
        token="text_sb_10"
        color={isLeader ? colorChips.secondary[700] : colorChips.grayScale[600]}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {isLeader ? '모임장' : '멤버'}
      </Typo>
    </Box>
  );
};
