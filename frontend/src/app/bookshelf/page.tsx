'use client';

// 책방(모임 홈) — 다음 단계에서 구현. 입장 플로우가 끊기지 않도록 둔 스텁.
import { Stack } from '@mui/material';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { Header } from '@/shared/components/layout/Header';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

export default function BookshelfPage() {
  return (
    <>
      <Header />
      <CommonContainer sx={{ py: 6 }}>
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typo token="text_b_20">책방을 준비하고 있어요</Typo>
          <Typo token="text_r_14" color={colorChips.grayScale[600]}>
            다음 단계에서 우리 모임의 책들이 여기에 채워집니다.
          </Typo>
        </Stack>
      </CommonContainer>
    </>
  );
}
