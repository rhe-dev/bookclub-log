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
  const router = useRouter();
  const hadSessionRef = useRef(false);

  useEffect(() => {
    if (member && club) {
      hadSessionRef.current = true;
      return;
    }
    if (!hadSessionRef.current) {
      toast.info('로그인 후 이용할 수 있어요.');
    }
    router.replace(ROUTES.home);
  }, [member, club, router]);

  return member && club ? { member, club } : null;
};
