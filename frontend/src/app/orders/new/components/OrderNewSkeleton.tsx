import { Box, Skeleton, Stack } from '@mui/material';

/** 문집 만들기 로딩 스켈레톤 — 스텝 바 + 책 선택 그리드 자리 */
export const OrderNewSkeleton = () => (
  <Stack spacing={2}>
    <Skeleton variant="rounded" height={40} />
    <Skeleton variant="text" width={280} height={22} />
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: { xs: 1.5, md: 2 },
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
);
