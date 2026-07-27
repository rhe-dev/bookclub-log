'use client';

// 책 상세(토론) — 다음 단계에서 구현. 책방에서의 이동이 끊기지 않도록 둔 스텁.
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { Header } from '@/shared/components/layout/Header';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

export default function BookDetailPage() {
  const router = useRouter();
  return (
    <>
      <Header />
      <CommonContainer sx={{ py: 6 }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Typo token="text_b_20">책 상세를 준비하고 있어요</Typo>
          <Typo token="text_r_14" color={colorChips.grayScale[600]}>
            다음 단계에서 토론 스레드가 여기에 열립니다.
          </Typo>
          <CommonButton
            label="책방으로 돌아가기"
            buttonColor="tertiary"
            onClick={() => router.back()}
          />
        </Stack>
      </CommonContainer>
    </>
  );
}
