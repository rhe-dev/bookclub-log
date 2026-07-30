'use client';

import { Box, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';

interface AnthologyCoverProps {
  color: string;
  emoji: string;
  title: string;
  clubName: string;
  /** 수록 기간 — 표지 하단에 들어간다 */
  period?: string;
  /** 판형 실측 크기 (mm) — 비율과 상대적 크기를 그대로 반영한다 */
  widthMm: number;
  heightMm: number;
  /** 가장 큰 판형의 폭이 이 값이 되도록 맞춘다 */
  maxWidth?: number;
}

/** 카탈로그에서 가장 넓은 판형(스퀘어북 243mm) — 판형끼리 크기 차이가 보이게 하는 기준 */
const WIDEST_SPEC_MM = 243;

/**
 * 문집 표지 미리보기 — 판형을 바꾸면 **비율과 크기가 함께 바뀐다**.
 * 판형 선택이 추상적인 코드 고르기가 아니라 "어떤 책이 나오는지" 보이게 하려는 장치다.
 * 책 표지 컨벤션(색 + 이모지)을 그대로 이어 쓴다 (D-033).
 */
export const AnthologyCover = ({
  color,
  emoji,
  title,
  clubName,
  period,
  widthMm,
  heightMm,
  maxWidth = 200,
}: AnthologyCoverProps) => {
  const width = (widthMm / WIDEST_SPEC_MM) * maxWidth;

  return (
    <Box
      sx={{
        width,
        aspectRatio: `${widthMm} / ${heightMm}`,
        borderRadius: 1.5,
        backgroundColor: color,
        // 실물 표지처럼 책등 쪽에 그림자를 둔다
        boxShadow: `inset 6px 0 12px -6px rgba(0,0,0,0.45)`,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'width 0.2s ease',
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ fontSize: 28, lineHeight: 1 }}>{emoji}</Box>
        <Typo
          token="text_sb_14"
          color={colorChips.basic.white}
          sx={{ ...lineClamp(3), wordBreak: 'keep-all' }}
        >
          {title || '문집 제목'}
        </Typo>
      </Stack>
      <Stack spacing={0.25}>
        <Typo
          token="text_r_12"
          color={colorChips.basic.white}
          sx={{ opacity: 0.85 }}
          noWrap
        >
          {clubName}
        </Typo>
        {period && (
          <Typo
            token="text_r_12"
            color={colorChips.basic.white}
            sx={{ opacity: 0.7 }}
            noWrap
          >
            {period}
          </Typo>
        )}
      </Stack>
    </Box>
  );
};
