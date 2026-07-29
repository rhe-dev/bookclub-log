'use client';

// 운영자 회원 관리 — 다음 단계에서 구현(TODO /admin ③). 메뉴가 빈 화면으로 끊기지 않도록 둔 스텁
import { Stack } from '@mui/material';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { Typo } from '@/shared/components/ui/Typo';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { colorChips } from '@/shared/styles/colors';

export default function AdminMembersPage() {
  const isAdmin = useRequireAdmin();
  if (!isAdmin) return null;

  return (
    <CommonContainer maxWidth={1600} sx={{ py: { xs: 3, md: 5 } }}>
      <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
        회원 관리
      </Typo>
      <Stack spacing={1} sx={{ alignItems: 'center', py: 8 }}>
        <Typo token="text_m_16" color={colorChips.grayScale[600]}>
          회원 목록·가입 클럽·상태 관리를 준비하고 있어요.
        </Typo>
      </Stack>
    </CommonContainer>
  );
}
