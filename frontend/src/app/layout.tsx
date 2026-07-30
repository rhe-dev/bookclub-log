import type { Metadata } from 'next';
// 단일 파일(2MB) 대신 유니코드 범위별 서브셋 — 화면에 실제로 쓰인 글자 범위만 내려받는다
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import { AppShell } from '@/shared/components/layout/AppShell';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: '북클럽 로그', template: '%s | 북클럽 로그' },
  description: '모임이 함께 읽은 책과 토론이 쌓이는 우리 모임 책방',
  /*
   * iOS 사파리가 전화번호·주소를 자동으로 링크로 바꾸면서 React가 붙기 전에 DOM을 고친다.
   * 그러면 서버 HTML과 클라이언트 트리가 어긋나 하이드레이션 경고가 뜬다 —
   * 푸터의 사업자 정보(전화·사업자등록번호)가 그 대상이었다.
   */
  formatDetection: { telephone: false, date: false, address: false },
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
    /*
     * 확장·앱 웹뷰가 React 로드 전에 <html>에 속성을 끼워 넣는 일이 흔하다
     * (실제로 모바일에서 __gcrremoteframetoken이 붙어 하이드레이션 경고가 떴다).
     * 루트 한 요소의 속성 비교만 끄는 것이라 트리 안쪽의 진짜 불일치는 그대로 잡힌다.
     */
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
