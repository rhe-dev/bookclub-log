import { Skeleton, Stack } from '@mui/material';

/** 마이페이지 로딩 스켈레톤 — 프로필 카드 + 주문 카드 자리 */
export const MyPageSkeleton = () => (
  <Stack spacing={2}>
    <Skeleton variant="rounded" height={88} />
    <Skeleton variant="text" width={140} height={28} />
    <Skeleton variant="rounded" height={200} />
    <Skeleton variant="rounded" height={200} />
  </Stack>
);
