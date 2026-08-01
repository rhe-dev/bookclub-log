'use client';

import { useRouter } from 'next/navigation';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';

/**
 * 없는 경로 — 루트 레이아웃 안에서 그려지므로 GNB·푸터가 그대로 남는다.
 * (Next 기본 화면은 영문 흑백 페이지에 헤더도 돌아갈 길도 없다.)
 *
 * 여기는 **경로 자체가 없는 경우**만 받는다. 경로는 맞지만 그 데이터가 없는 경우
 * (지워진 책·잘못된 주문번호)는 각 화면이 무엇을 못 찾았는지 밝힌다 — QueryErrorView.
 */
export default function NotFound() {
  const router = useRouter();
  const member = useMemberStore((s) => s.member);
  const isAdmin = useMemberStore((s) => s.isAdmin);

  const backTo = isAdmin
    ? { label: '주문 관리로', href: ROUTES.adminOrders }
    : member
      ? { label: '책방으로', href: ROUTES.bookshelf }
      : { label: '처음으로', href: ROUTES.home };

  return (
    <CommonContainer
      maxWidth={520}
      sx={{ py: { xs: 10, md: 16 }, alignItems: 'center' }}
    >
      <Typo token="text_b_28" color={colorChips.grayScale[300]}>
        404
      </Typo>
      <VerticalGap size={16} />
      <Typo token="text_b_18" color={colorChips.grayScale[800]} align="center">
        찾을 수 없는 페이지예요
      </Typo>
      <VerticalGap size={8} />
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[600]}
        align="center"
        sx={{ wordBreak: 'keep-all' }}
      >
        주소가 잘못되었거나, 페이지가 옮겨졌을 수 있어요.
      </Typo>
      <VerticalGap size={24} />
      <CommonButton
        label={backTo.label}
        onClick={() => router.replace(backTo.href)}
      />
    </CommonContainer>
  );
}
