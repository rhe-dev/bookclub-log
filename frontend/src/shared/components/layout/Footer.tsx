'use client';

import { Divider, Stack } from '@mui/material';
import Image from 'next/image';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { CommonContainer } from './CommonContainer';

/**
 * 공통 푸터 — 로고·서비스 소개·데모 고지·카피라이트.
 *
 * 실제 서비스라면 전자상거래법상 사업자 정보(상호·사업자등록번호·통신판매업신고)가
 * 들어갈 자리다. 다만 값이 전부 플레이스홀더면 화면에서는 미완성으로만 읽히므로,
 * 무엇이 빠졌는지 밝히는 한 줄로 대신한다.
 */
export const Footer = () => {
  return (
    <Stack
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: colorChips.grayScale[200],
        borderTop: `1px solid ${colorChips.grayScale[300]}`,
      }}
    >
      <CommonContainer sx={{ py: { xs: 4, md: 6 }, gap: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Image
              src="/logo.svg"
              alt="북클럽 로그 로고"
              width={24}
              height={24}
            />
            <Typo token="text_b_16" color={colorChips.grayScale[800]}>
              북클럽 로그
            </Typo>
          </Stack>
          <Typo
            token="text_r_14"
            color={colorChips.grayScale[600]}
            sx={{ wordBreak: 'keep-all' }}
          >
            모임이 함께 읽은 책과 토론이 쌓이는
            <br />
            우리 모임 책방
          </Typo>
        </Stack>

        <Typo
          token="text_r_12"
          color={colorChips.grayScale[500]}
          sx={{ wordBreak: 'keep-all' }}
        >
          채용 과제로 만든 데모입니다. 결제·실제 제작은 연결되어 있지 않고,
          사업자 정보와 약관은 넣지 않았어요.
        </Typo>

        <Divider sx={{ borderColor: colorChips.grayScale[300] }} />

        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          Copyright © BookClub Log.
        </Typo>
      </CommonContainer>
    </Stack>
  );
};
