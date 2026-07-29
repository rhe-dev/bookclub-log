'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import { type CurrentClub, useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';
import type { MemberSummary } from '@/shared/types/member';

export interface RequiredSession {
  member: MemberSummary;
  club: CurrentClub;
}

/**
 * 로그인이 필요한 페이지 가드 — 비로그인 직접 접근이면 안내 토스트 후 소개 페이지로.
 * 로그아웃(의도적 초기화)으로 비워진 경우에는 토스트 없이 조용히 보낸다.
 * null을 반환하는 동안 페이지는 렌더하지 않는다.
 */
export const useRequireMember = (): RequiredSession | null => {
  const member = useMemberStore((s) => s.member);
  const club = useMemberStore((s) => s.club);
  const isAdmin = useMemberStore((s) => s.isAdmin);
  const router = useRouter();
  const hadSessionRef = useRef(false);

  useEffect(() => {
    // 판정은 렌더 스냅샷이 아니라 스토어 현재 값으로 — SSR 하이드레이션 첫 렌더는
    // 서버 스냅샷(초기값 null)이라, 로그인 상태에서 직접 진입해도 오탐 리다이렉트됐다
    const live = useMemberStore.getState();
    if (live.isAdmin) {
      // 운영자 세션은 서비스 화면을 쓰지 않는다 (D-029)
      toast.info('운영자 화면에서는 이용할 수 없어요.');
      router.replace(ROUTES.adminOrders);
      return;
    }
    if (live.member && live.club) {
      hadSessionRef.current = true;
      return;
    }
    if (!hadSessionRef.current) {
      toast.info('로그인 후 이용할 수 있어요.');
    }
    router.replace(ROUTES.home);
  }, [member, club, isAdmin, router]);

  return !isAdmin && member && club ? { member, club } : null;
};
