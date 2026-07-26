'use client';

import { Stack, StackProps } from '@mui/material';

interface CommonContainerProps extends Omit<StackProps, 'maxWidth'> {
  /** 콘텐츠 최대 폭(px) — 기본 1200 */
  maxWidth?: number;
}

/** 페이지 콘텐츠 컨테이너 — 가운데 정렬 + 양옆 패딩 20px 고정 */
export const CommonContainer = ({
  maxWidth = 1200,
  sx,
  children,
  ...stackProps
}: CommonContainerProps) => {
  return (
    <Stack
      sx={[
        { width: '100%', maxWidth, mx: 'auto', px: '20px' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...stackProps}
    >
      {children}
    </Stack>
  );
};
