'use client';

import { Box, SxProps, Theme } from '@mui/material';

type ResponsiveSize = number | { xs: number; md: number };

interface MemberAvatarProps {
  color: string;
  emoji: string;
  /** px 또는 { xs, md } */
  size?: ResponsiveSize;
  title?: string;
  sx?: SxProps<Theme>;
}

const toSizeSx = (size: ResponsiveSize) =>
  typeof size === 'number'
    ? { width: size, height: size, fontSize: size * 0.5 }
    : {
        width: { xs: size.xs, md: size.md },
        height: { xs: size.xs, md: size.md },
        fontSize: { xs: size.xs * 0.5, md: size.md * 0.5 },
      };

/** 멤버 아바타 원 — 멤버 색 배경 + 이모지 */
export const MemberAvatar = ({
  color,
  emoji,
  size = 32,
  title,
  sx,
}: MemberAvatarProps) => {
  return (
    <Box
      title={title}
      sx={[
        {
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: color,
          ...toSizeSx(size),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {emoji}
    </Box>
  );
};
