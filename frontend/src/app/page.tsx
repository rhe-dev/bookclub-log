'use client';

// 서비스 소개(랜딩) — 비로그인 첫 화면, 기능 소개 + 모임 시작(로그인) CTA (D-024)
import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useLoginModalStore } from '@/shared/stores/loginModalStore';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';

const FEATURES = [
  {
    emoji: '📚',
    title: '모임 책방',
    description:
      '함께 읽는 책을 한 곳에. 읽는 중·읽을 예정·완독 상태와 일정, 참여 멤버까지 한눈에 보여요.',
  },
  {
    emoji: '💬',
    title: '책 토론',
    description:
      '페이지와 인용을 달아 밑줄과 생각을 남겨요. 답글과 공감으로 이어지는 우리 모임의 토론 기록.',
  },
  {
    emoji: '📖',
    title: '문집 만들기',
    description:
      '완독한 책의 토론을 모아 실물 문집으로. 주문부터 제작·배송 현황까지 서비스에서 확인해요.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const member = useMemberStore((s) => s.member);
  const openLoginModal = useLoginModalStore((s) => s.open);

  return (
    <CommonContainer maxWidth={880} sx={{ py: { xs: 6, md: 10 } }}>
      <Stack sx={{ alignItems: 'center' }}>
        <Typo
          token="text_b_28"
          align="center"
          sx={{ fontSize: { xs: 22, md: 28 }, wordBreak: 'keep-all' }}
        >
          모임이 함께 읽은 책과 토론이 쌓이는
          <br />
          <Typo
            component="span"
            token="text_b_28"
            color={colorChips.primary[500]}
            sx={{ fontSize: { xs: 22, md: 28 } }}
          >
            우리 모임 책방
          </Typo>
        </Typo>
        <VerticalGap size={16} />
        <Typo
          token="text_r_14"
          color={colorChips.grayScale[600]}
          align="center"
          sx={{ maxWidth: 520, wordBreak: 'keep-all' }}
        >
          북클럽 로그는 온라인 독서모임의 책과 코멘트를 아카이브하고, 함께 읽은
          기록을 실물 문집으로 만들어 주는 서비스예요.
        </Typo>

        <VerticalGap size={32} />
        {member ? (
          <CommonButton
            label="내 책방으로 가기"
            size="large"
            onClick={() => router.push(ROUTES.bookshelf)}
          />
        ) : (
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <CommonButton
              label="모임 시작하기"
              size="large"
              onClick={openLoginModal}
            />
            <Typo token="text_r_12" color={colorChips.grayScale[500]}>
              데모 서비스 — 계정 선택만으로 바로 시작할 수 있어요
            </Typo>
          </Stack>
        )}

        <VerticalGap size={56} />
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature.title}
              sx={{
                border: `1px solid ${colorChips.grayScale[200]}`,
                borderRadius: 2,
                backgroundColor: colorChips.basic.white,
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Typo token="text_b_24" component="div">
                {feature.emoji}
              </Typo>
              <VerticalGap size={12} />
              <Typo token="text_sb_16" color={colorChips.grayScale[800]}>
                {feature.title}
              </Typo>
              <VerticalGap size={8} />
              <Typo
                token="text_r_14"
                color={colorChips.grayScale[600]}
                sx={{ wordBreak: 'keep-all' }}
              >
                {feature.description}
              </Typo>
            </Box>
          ))}
        </Box>
      </Stack>
    </CommonContainer>
  );
}
