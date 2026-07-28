import { Box, Skeleton, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';

/** 히어로(지금 읽는 책) 스켈레톤 — 고정 타이틀은 실텍스트, 데이터 영역만 스켈레톤 */
export const ReadingHeroSkeleton = () => (
  <Stack spacing={1.5}>
    <Typo token="text_sb_18">지금 읽는 책</Typo>
    <Skeleton variant="rounded" height={168} />
  </Stack>
);

/** 책장 그리드 스켈레톤 — 필터 변경 시에는 이 영역만 로딩 표시 */
export const ShelfGridSkeleton = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(3, 1fr)',
        md: 'repeat(4, 1fr)',
      },
      gap: 2,
    }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <Stack key={i} spacing={1}>
        <Skeleton
          variant="rounded"
          sx={{ aspectRatio: '3 / 4', height: 'auto' }}
        />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="50%" />
      </Stack>
    ))}
  </Box>
);
