import { getQueryClient } from '@/shared/api/queryClient';
import { useAdminFilterStore } from './adminFilterStore';
import { useLoginModalStore } from './loginModalStore';
import { useMemberStore } from './memberStore';

/** 이 앱이 localStorage에 쓰는 키 접두사 — 구버전 세션 키까지 함께 걷어내려고 접두사로 훑는다 */
const STORAGE_PREFIX = 'bookclub-';

/**
 * 세션 종료 — 회원·운영자 화면을 한 웹에서 함께 쓰는 구성이라(D-029)
 * 다음 로그인에 이전 세션의 흔적이 남지 않도록 스토어·localStorage·서버 캐시를 모두 비운다.
 * (운영자로 걸어둔 주문 관리 필터가 재로그인 후에도 남아 있던 문제)
 */
export const resetSession = () => {
  useMemberStore.getState().logout();
  // 필터 자체는 URL에 있으니 여기서는 '최근 위치' 기억만 지운다
  useAdminFilterStore.setState({
    lastQuery: { orders: '', members: '', clubs: '' },
  });
  useLoginModalStore.getState().close();

  // 스토어를 비운 뒤에 지운다 — 순서가 바뀌면 logout()의 저장이 키를 되살린다
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));

  // 이전 세션이 받아둔 응답(내 주문·운영자 목록 등)이 다음 화면에 비치지 않게
  getQueryClient().clear();
};
