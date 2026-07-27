'use client';

import { Box } from '@mui/material';
import { Footer } from './Footer';
import { Header } from './Header';

/** 루트 레이아웃 공통 셸 — Header + 본문 + Footer(sticky) */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
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
