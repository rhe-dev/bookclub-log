'use client';

import { useRouter } from 'next/navigation';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';

/**
 * 예기치 못한 렌더 오류 — 조회 실패(ErrorView)로 잡히지 않고 트리가 깨진 경우.
 * 화면 하나가 무너져도 서비스 밖으로 튕기지 않도록, 레이아웃 안에서 다시 시도할 길을 준다.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <CommonContainer
      maxWidth={520}
      sx={{ py: { xs: 10, md: 16 }, alignItems: 'center' }}
    >
      <Typo token="text_b_18" color={colorChips.grayScale[800]} align="center">
        화면을 여는 중 문제가 생겼어요
      </Typo>
      <VerticalGap size={8} />
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[600]}
        align="center"
        sx={{ wordBreak: 'keep-all' }}
      >
        잠시 후 다시 시도해 주세요. 계속 같은 화면이 보이면 처음부터 다시
        들어와 주세요.
      </Typo>
      <VerticalGap size={24} />
      <CommonButton label="다시 시도" onClick={reset} />
      <VerticalGap size={8} />
      <CommonButton
        label="처음으로"
        buttonVariant="outlined"
        buttonColor="tertiary"
        onClick={() => router.replace(ROUTES.home)}
      />
    </CommonContainer>
  );
}
