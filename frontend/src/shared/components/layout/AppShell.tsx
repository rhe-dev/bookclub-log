'use client';

import { Box } from '@mui/material';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * 루트 레이아웃 공통 셸 — Header + 본문 + Footer(sticky).
 *
 * 폭 관련 스타일을 두지 않는다. `minWidth: fit-content`를 걸었더니 페이지 폭이 콘텐츠의
 * max-content로 잡혀, 창을 줄일 때 가로/세로 스크롤바가 번갈아 나타나며 줄바꿈 판정이
 * 뒤집히는 진동(깜빡임)이 생겼다. 넓은 콘텐츠(운영자 테이블·읽는 책 캐러셀)는 각자
 * `contain: inline-size` + `overflowX: auto`로 자기 안에서 가로 스크롤을 처리한다.
 */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
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
