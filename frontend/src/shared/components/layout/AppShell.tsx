'use client';

import { Box } from '@mui/material';
import { Footer } from './Footer';
import { Header } from './Header';

/** 루트 레이아웃 공통 셸 — Header + 본문 + Footer(sticky) */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        // 콘텐츠가 뷰포트보다 넓어 가로 스크롤이 생겨도 헤더·푸터가 잘리지 않게
        minWidth: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};
