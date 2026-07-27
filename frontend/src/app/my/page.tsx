'use client';

// 마이페이지 — 다음 단계에서 구현. 주문 완료 플로우가 끊기지 않도록 둔 스텁.
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

export default function MyPage() {
  const router = useRouter();
  return (
    <CommonContainer sx={{ py: 6 }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Typo token="text_b_20">마이페이지를 준비하고 있어요</Typo>
        <Typo token="text_r_14" color={colorChips.grayScale[600]}>
          다음 단계에서 주문 진행 상황이 여기에 표시됩니다.
        </Typo>
        <CommonButton
          label="책방으로 돌아가기"
          buttonColor="tertiary"
          onClick={() => router.back()}
        />
      </Stack>
    </CommonContainer>
  );
}
