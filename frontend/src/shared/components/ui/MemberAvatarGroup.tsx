'use client';

import { Box } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';
import type { MemberSummary } from '@/shared/types/member';
import { MemberAvatar } from './MemberAvatar';
import { Typo } from './Typo';

interface MemberAvatarGroupProps {
  members: MemberSummary[];
  size?: number;
  max?: number;
}

/** 겹쳐 보이는 멤버 아바타 그룹 — max 초과분은 +N */
export const MemberAvatarGroup = ({
  members,
  size = 28,
  max = 4,
}: MemberAvatarGroupProps) => {
  const visible = members.slice(0, max);
  const rest = members.length - visible.length;
  const overlapSx = {
    border: `2px solid ${colorChips.basic.white}`,
  } as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((member, index) => (
        <MemberAvatar
          key={member.publicId}
          color={member.color}
          emoji={member.avatarEmoji}
          size={size}
          title={member.name}
          sx={{ ...overlapSx, ml: index === 0 ? 0 : '-8px' }}
        />
      ))}
      {rest > 0 && (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: colorChips.grayScale[200],
            ...overlapSx,
            ml: '-8px',
          }}
        >
          <Typo token="text_sb_12" color={colorChips.grayScale[600]}>
            +{rest}
          </Typo>
        </Box>
      )}
    </Box>
  );
};
