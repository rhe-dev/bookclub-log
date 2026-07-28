'use client';

import { Pagination, Stack } from '@mui/material';

interface CommonPaginationProps {
  page: number;
  totalCount: number;
  pageSize: number;
  onChange: (page: number) => void;
}

/** 번호 페이지네이션 — 보편 관례대로 2페이지 이상일 때만 노출한다 (D-026) */
export const CommonPagination = ({
  page,
  totalCount,
  pageSize,
  onChange,
}: CommonPaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;
  return (
    <Stack sx={{ alignItems: 'center', pt: 2 }}>
      <Pagination
        page={page}
        count={totalPages}
        onChange={(_, next) => onChange(next)}
        color="primary"
        shape="rounded"
      />
    </Stack>
  );
};
