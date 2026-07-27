'use client';

import { Box } from '@mui/material';

type Responsive<T> = T | { xs: T; md: T };

interface BookCoverProps {
  color: string;
  emoji: string;
  /** 기본 100%(그리드 셀 채움) */
  width?: Responsive<number | string>;
  fontSize?: Responsive<number>;
  borderRadius?: number;
}

/** 책 표지 — 색 배경 + 이모지, 3:4 비율 (이미지 업로드 대신, PLAN §7) */
export const BookCover = ({
  color,
  emoji,
  width = '100%',
  fontSize = 44,
  borderRadius = 2.5,
}: BookCoverProps) => {
  return (
    <Box
      sx={{
        width,
        aspectRatio: '3 / 4',
        borderRadius,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        flexShrink: 0,
      }}
    >
      {emoji}
    </Box>
  );
};
