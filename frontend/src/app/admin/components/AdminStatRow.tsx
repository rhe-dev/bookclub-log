'use client';

import { Box } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

/** 상세 상단 활동 요약 — 회원·모임이 같은 모양을 쓴다 */
export const AdminStatRow = ({
  stats,
}: {
  stats: { label: string; value: string }[];
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
      gap: 1,
    }}
  >
    {stats.map((stat) => (
      <Box
        key={stat.label}
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${colorChips.grayScale[200]}`,
          backgroundColor: colorChips.grayScale[100],
        }}
      >
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          {stat.label}
        </Typo>
        <Typo token="text_b_18" color={colorChips.grayScale[800]}>
          {stat.value}
        </Typo>
      </Box>
    ))}
  </Box>
);
