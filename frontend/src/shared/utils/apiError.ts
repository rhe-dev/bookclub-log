import axios from 'axios';
import type { ApiErrorItem } from '@/shared/types/common';

/**
 * 백엔드 전역 에러 포맷에서 에러 목록을 꺼낸다 (D-028) — 네트워크·미상 오류는 UNKNOWN으로 합성.
 * 전역 토스트와 화면별 분기가 같은 판정을 쓰도록 한 곳에 둔다.
 */
export function getApiErrors(error: unknown): ApiErrorItem[] {
  if (axios.isAxiosError(error)) {
    const errors = (error.response?.data as { errors?: ApiErrorItem[] })?.errors;
    if (errors?.length) return errors;
    if (!error.response)
      return [{ code: 'UNKNOWN', message: '네트워크 연결을 확인해 주세요.' }];
  }
  return [
    {
      code: 'UNKNOWN',
      message: '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    },
  ];
}

/**
 * 대상이 없어서 실패한 조회인가.
 *
 * 주소의 id가 틀렸거나 그 사이에 삭제된 경우로, **다시 시도해도 결과가 달라지지 않는다**.
 * 화면은 '다시 시도' 대신 무엇을 찾지 못했는지 알리고 돌아갈 곳을 준다.
 */
export const isNotFoundError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;
