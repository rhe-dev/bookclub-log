'use client';

import { Box } from '@mui/material';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { colorChips } from '@/shared/styles/colors';

/**
 * 운영자 상세 페이지 껍데기 — 배경을 흰색으로 깐다.
 *
 * 목록 화면은 회색 배경 위에 흰 테이블이 얹혀 구분이 되지만, 상세는 카드가 여럿이라
 * 회색 위에 흰 카드가 겹치면 섹션 경계가 흐려진다. 상세만 흰 바탕으로 뒤집고
 * 안쪽 카드는 옅은 회색으로 둬서 대비를 만든다.
 */
export const AdminDetailShell = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      flex: 1,
      backgroundColor: colorChips.basic.white,
    }}
  >
    <CommonContainer maxWidth={880} sx={{ py: { xs: 3, md: 5 } }}>
      {children}
    </CommonContainer>
  </Box>
);
