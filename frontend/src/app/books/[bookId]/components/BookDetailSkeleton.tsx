import { Skeleton, Stack } from '@mui/material';

/** 책 상세 로딩 스켈레톤 — 책 정보 카드 + 코멘트 목록 자리 */
export const BookDetailSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={180} />
    <Skeleton variant="text" width={120} height={30} />
    <Skeleton variant="rounded" height={110} />
    {Array.from({ length: 3 }).map((_, i) => (
      <Stack key={i} direction="row" spacing={1.5}>
        <Skeleton variant="circular" width={32} height={32} />
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <Skeleton variant="text" width={140} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      </Stack>
    ))}
  </Stack>
);
