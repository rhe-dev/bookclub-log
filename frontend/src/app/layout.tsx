import type { Metadata } from 'next';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import { AppShell } from '@/shared/components/layout/AppShell';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: '북클럽 로그', template: '%s | 북클럽 로그' },
  description: '모임이 함께 읽은 책과 토론이 쌓이는 우리 모임 책방',
  openGraph: {
    title: '북클럽 로그',
    description: '모임이 함께 읽은 책과 토론이 쌓이는 우리 모임 책방',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
