'use client';

import { isNotFoundError } from '@/shared/utils/apiError';
import { ErrorView } from './ErrorView';

interface QueryErrorViewProps {
  /** TanStack Query가 넘겨준 에러 — 404 여부로 문구와 액션을 가른다 */
  error: unknown;
  /** 대상이 없을 때 — "책 정보를 찾을 수 없어요." 처럼 무엇을 못 찾았는지 밝힌다 */
  notFoundMessage: string;
  /** 그 밖의 조회 실패 — 네트워크·서버 오류처럼 다시 시도할 만한 경우 */
  failMessage: string;
  onRetry: () => void;
  /** 목록으로 돌아가기 같은 다음 행동 — 대상이 없을 때는 이쪽이 유일한 출구다 */
  children?: React.ReactNode;
}

/**
 * 상세 조회 실패 뷰 — 주소의 id가 틀렸거나 삭제된 경우와 그 밖의 오류를 나눠 안내한다.
 *
 * 없는 대상에 '다시 시도'를 권하면 영원히 실패하는 버튼을 누르게 된다.
 * 잘못된 경로 전체는 공통 404(app/not-found)가 받고, 여기서는
 * **경로는 맞지만 그 데이터가 없는 경우**를 도메인 문구로 설명한다.
 */
export const QueryErrorView = ({
  error,
  notFoundMessage,
  failMessage,
  onRetry,
  children,
}: QueryErrorViewProps) => {
  const notFound = isNotFoundError(error);

  return (
    <ErrorView
      message={notFound ? notFoundMessage : failMessage}
      onRetry={notFound ? undefined : onRetry}
    >
      {children}
    </ErrorView>
  );
};
