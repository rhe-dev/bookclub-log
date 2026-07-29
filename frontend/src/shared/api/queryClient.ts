import { isServer, QueryClient } from '@tanstack/react-query';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    },
  });

let browserQueryClient: QueryClient | undefined;

/**
 * 서버 렌더는 요청마다 새 캐시, 브라우저는 하나를 재사용한다.
 * 리액트 밖(로그아웃 처리 등)에서도 캐시를 비울 수 있도록 모듈에서 들고 있는다.
 */
export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
