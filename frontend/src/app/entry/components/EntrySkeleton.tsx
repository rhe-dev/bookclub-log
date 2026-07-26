import { Box, Skeleton, Stack } from '@mui/material';

/** 입장 화면 로딩 스켈레톤 — 모임 카드 + 프로필 그리드 자리 */
export const EntrySkeleton = () => (
  <Stack spacing={3.5} sx={{ alignItems: 'center' }}>
    <Stack spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
      <Skeleton variant="text" width={160} height={30} />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width={80} />
    </Stack>
    <Skeleton variant="text" width={140} height={26} />
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Stack key={i} spacing={1} sx={{ alignItems: 'center', py: 1.5 }}>
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton variant="text" width={56} />
        </Stack>
      ))}
    </Box>
  </Stack>
);
