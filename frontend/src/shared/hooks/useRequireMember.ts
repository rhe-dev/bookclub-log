'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';

/**
 * 멤버 선택이 필요한 페이지 가드 — 미선택 직접 접근이면 입장 화면으로.
 * null을 반환하는 동안 페이지는 렌더하지 않는다.
 */
export const useRequireMember = () => {
  const member = useMemberStore((s) => s.member);
  const router = useRouter();

  useEffect(() => {
    if (!member) router.replace(ROUTES.entry);
  }, [member, router]);

  return member;
};
