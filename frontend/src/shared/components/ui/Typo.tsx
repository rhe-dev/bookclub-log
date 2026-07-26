'use client';

import { Typography, TypographyProps } from '@mui/material';
import { typographyTokens, TypoToken } from '@/shared/styles/typography';

interface TypoProps extends Omit<TypographyProps, 'variant' | 'color'> {
  token: TypoToken;
  /** colorChips 토큰 값을 넣는다 (기본: 상속) */
  color?: string;
}

export const Typo = ({ token, color, sx, children, ...props }: TypoProps) => {
  return (
    <Typography
      sx={[
        typographyTokens[token],
        Boolean(color) && { color },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Typography>
  );
};
