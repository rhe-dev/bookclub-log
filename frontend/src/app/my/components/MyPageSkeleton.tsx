import { Box, Skeleton, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { colorChips } from '@/shared/styles/colors';

/**
 * 마이페이지 로딩 스켈레톤 — 프로필 카드 + 활동 탭 + 목록 자리.
 * 고정 문구('가입한 클럽')는 실텍스트로 두고 서버 데이터 영역만 스켈레톤으로 표시한다.
 */
export const MyPageSkeleton = () => (
  <>
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${colorChips.grayScale[200]}`,
        backgroundColor: colorChips.basic.white,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={72} height={26} />
        </Stack>
        <Skeleton variant="rounded" width={76} height={32} />
      </Stack>

      <VerticalGap size={16} />
      <Typo token="text_m_12" color={colorChips.grayScale[500]}>
        가입한 클럽
      </Typo>
      <VerticalGap size={8} />
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={46} />
        <Skeleton variant="rounded" height={46} />
      </Stack>
    </Box>

    <VerticalGap size={16} />

    {/* 탭 라벨에 건수가 실리므로 탭 바도 스켈레톤 */}
    <Stack
      direction="row"
      sx={{ borderBottom: `1px solid ${colorChips.grayScale[200]}`, pb: 1.5 }}
    >
      {[0, 1].map((i) => (
        <Box
          key={i}
          sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <Skeleton variant="text" width={96} height={24} />
        </Box>
      ))}
    </Stack>
    <VerticalGap size={16} />

    <Stack spacing={1.5}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={150} />
      ))}
    </Stack>
  </>
);
