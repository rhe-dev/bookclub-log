'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';

/**
 * 운영자 전용 화면 가드 — 관리자 세션이 아니면 안내 후 소개 화면으로 (D-029).
 * false를 반환하는 동안 화면은 렌더하지 않는다.
 */
export const useRequireAdmin = () => {
  const isAdmin = useMemberStore((s) => s.isAdmin);
  const router = useRouter();
  const hadAdminRef = useRef(false);

  useEffect(() => {
    // 하이드레이션 첫 렌더의 초기값 오탐을 피해 스토어 현재 값으로 판정
    if (useMemberStore.getState().isAdmin) {
      hadAdminRef.current = true;
      return;
    }
    if (!hadAdminRef.current) {
      toast.info('운영자로 로그인해 주세요.');
    }
    router.replace(ROUTES.home);
  }, [isAdmin, router]);

  return isAdmin;
};
