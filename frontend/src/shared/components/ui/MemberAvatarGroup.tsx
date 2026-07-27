'use client';

import { Box } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';
import { Typo } from './Typo';
import type { MemberSummary } from '@/shared/types/member';

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

  const circleSx = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.45,
    border: `2px solid ${colorChips.basic.white}`,
    flexShrink: 0,
  } as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((member, index) => (
        <Box
          key={member.publicId}
          title={member.name}
          sx={{
            ...circleSx,
            backgroundColor: member.color,
            ml: index === 0 ? 0 : '-8px',
          }}
        >
          {member.avatarEmoji}
        </Box>
      ))}
      {rest > 0 && (
        <Box
          sx={{
            ...circleSx,
            backgroundColor: colorChips.grayScale[200],
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
