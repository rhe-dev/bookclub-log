'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { resetSession } from '@/shared/stores/resetSession';
import { toast } from '@/shared/stores/toastStore';
import type { MyClub } from '@/shared/types/club';

/** GNB·마이페이지가 공유하는 세션 동작 — 모임 이동·로그아웃 (동선·문구 단일화) */
export const useSessionActions = () => {
  const router = useRouter();
  const club = useMemberStore((s) => s.club);
  const switchClub = useMemberStore((s) => s.switchClub);

  /** 모임 선택 — 다른 모임이면 컨텍스트 전환, 어느 쪽이든 그 모임 책방으로 */
  const goClub = (target: MyClub) => {
    if (target.publicId !== club?.publicId) {
      switchClub({
        publicId: target.publicId,
        name: target.name,
        role: target.myRole,
      });
      toast.success(`'${target.name}' 책방으로 이동했어요.`);
    }
    router.push(ROUTES.bookshelf);
  };

  const logout = () => {
    resetSession();
    toast.info('로그아웃했어요. 다음에 또 만나요!');
    router.replace(ROUTES.home);
  };

  return { goClub, logout };
};
