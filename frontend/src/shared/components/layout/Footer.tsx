'use client';

import { Divider, Stack } from '@mui/material';
import Image from 'next/image';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { CommonContainer } from './CommonContainer';

// 실제 사업자 정보 확정 전 플레이스홀더
const COMPANY_INFO_LINES = [
  '서울특별시 ○○구 ○○로 00, 0층',
  '대표: 홍길동 | 사업자등록번호: 000-00-00000',
  '통신판매업신고: 제0000-서울○○-0000호',
  '전화 00-0000-0000 | 팩스 00-0000-0000',
  '이메일 hello@bookclublog.example',
];

/** 공통 푸터 — 로고·서비스 소개·사업자 정보(플레이스홀더)·카피라이트 */
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

        <Stack spacing={0.5}>
          {COMPANY_INFO_LINES.map((line) => (
            <Typo
              key={line}
              token="text_r_12"
              color={colorChips.grayScale[500]}
              sx={{ wordBreak: 'keep-all' }}
            >
              {line}
            </Typo>
          ))}
        </Stack>

        <Divider sx={{ borderColor: colorChips.grayScale[300] }} />

        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          Copyright © BookClub Log.
        </Typo>
      </CommonContainer>
    </Stack>
  );
};
