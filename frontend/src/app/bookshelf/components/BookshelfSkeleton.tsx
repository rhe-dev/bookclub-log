import { Box, Skeleton, Stack } from '@mui/material';

/** 책방 로딩 스켈레톤 — 히어로 카드 + 그리드 자리 */
export const BookshelfSkeleton = () => (
  <Stack spacing={4}>
    <Stack spacing={1.5}>
      <Skeleton variant="text" width={120} height={28} />
      <Skeleton variant="rounded" height={168} />
    </Stack>
    <Stack spacing={1.5}>
      <Skeleton variant="text" width={160} height={28} />
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
    </Stack>
  </Stack>
);
