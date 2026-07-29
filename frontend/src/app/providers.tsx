'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/api/queryClient';
import { CommonToast } from '@/shared/components/ui/CommonToast';
import { theme } from '@/shared/styles/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  // 로그아웃 시 리액트 밖에서도 비울 수 있도록 캐시는 모듈에서 관리
  const queryClient = getQueryClient();

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {children}
          <CommonToast />
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
