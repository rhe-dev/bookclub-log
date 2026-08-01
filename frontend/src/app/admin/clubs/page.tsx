'use client';

// 운영자 모임 관리 — 조회 + 메모 (D-030 개정). 모임 상세로 들어가는 목록
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import { Box, InputAdornment, Skeleton, Stack, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAdminClubsQuery } from '@/shared/api/adminApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonEmptyState } from '@/shared/components/ui/CommonEmptyState';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import { formatDate } from '@/shared/utils/date';
import { useAdminClubParams } from '../adminListParams';

// 드롭다운 배경이 인풋 라운드 밖으로 비치지 않게 입력 영역에만 흰 배경
const FIELD_SX = {
  minWidth: 150,
  '& .MuiOutlinedInput-root': { backgroundColor: colorChips.basic.white },
} as const;

// useSearchParams(필터를 URL에 두는 D-038)는 Suspense 경계가 필요하다 —
// 없으면 프로덕션 빌드의 프리렌더가 실패한다. 페이지는 래퍼만 두고 본문은 아래 컴포넌트
export default function AdminClubsPage() {
  return (
    <Suspense fallback={null}>
      <AdminClubsContent />
    </Suspense>
  );
}

function AdminClubsContent() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  // 필터는 URL 쿼리가 단일 소스 — 조합을 링크로 공유할 수 있어야 한다 (D-038)
  const { q, from, to, search, setPeriod, reset } = useAdminClubParams();
  const [keyword, setKeyword] = useState(q ?? '');
  const clubsQuery = useAdminClubsQuery({ q, from, to });

  if (!isAdmin) return null;

  const clubs = clubsQuery.data ?? [];

  return (
    <CommonContainer maxWidth={1400} sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
          모임 관리
        </Typo>
        <Typo token="text_m_14" color={colorChips.grayScale[500]}>
          {clubs.length}개
        </Typo>
      </Stack>
      <VerticalGap size={4} />
      <Typo token="text_r_12" color={colorChips.grayScale[500]}>
        모임 정보는 조회만 합니다. 응대 기록은 모임 상세의 운영자 메모에 남겨
        주세요.
      </Typo>

      <VerticalGap size={16} />
      <Stack
        direction="row"
        // 좁은 화면에선 줄바꿈이 잦아 세로 간격을 넉넉히
        sx={{ flexWrap: 'wrap', gap: { xs: 1.5, md: 1 } }}
      >
        <TextField
          size="small"
          placeholder="모임명·모임 ID"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') search(keyword);
          }}
          onBlur={() => {
            if (keyword !== (q ?? '')) search(keyword);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{ fontSize: 18, color: colorChips.grayScale[400] }}
                  />
                </InputAdornment>
              ),
            },
          }}
          // 플레이스홀더가 다 보일 만큼만 — 남는 폭을 다 먹으면 줄바꿈이 요동친다
          sx={{ ...FIELD_SX, width: 300 }}
        />
        <TextField
          size="small"
          type="date"
          label="개설일 시작"
          value={from ?? ''}
          onChange={(e) => setPeriod({ from: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />
        <TextField
          size="small"
          type="date"
          label="개설일 종료"
          value={to ?? ''}
          onChange={(e) => setPeriod({ to: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />
        <CommonButton
          label="필터 초기화"
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={() => {
            setKeyword('');
            reset();
          }}
        />
      </Stack>

      <VerticalGap size={16} />
      {clubsQuery.isError ? (
        <ErrorView
          message="모임 목록을 불러오지 못했어요."
          onRetry={() => void clubsQuery.refetch()}
        />
      ) : clubsQuery.isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} />
          ))}
        </Box>
      ) : clubs.length === 0 ? (
        <CommonEmptyState
          message={
            // 조건 때문에 비었는지, 정말 하나도 없는지를 구분해야 다음 행동이 정해진다
            q || from || to
              ? '조건에 맞는 모임이 없어요.'
              : '아직 개설된 모임이 없어요.'
          }
        />
      ) : (
        /* 모임은 수가 적고 소개 문구가 있어 테이블보다 카드가 읽힌다 */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          {clubs.map((club) => (
            <Box
              key={club.publicId}
              onClick={() => router.push(ROUTES.adminClubDetail(club.publicId))}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: `1px solid ${colorChips.grayScale[200]}`,
                backgroundColor: colorChips.basic.white,
                cursor: 'pointer',
                '&:hover': { borderColor: colorChips.primary[300] },
              }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center' }}
              >
                <Typo token="text_sb_16" color={colorChips.grayScale[800]}>
                  {club.name}
                </Typo>
                {club.hasAdminNote && (
                  <StickyNote2OutlinedIcon
                    sx={{ fontSize: 15, color: colorChips.secondary[500] }}
                  />
                )}
              </Stack>
              <VerticalGap size={4} />
              <Typo
                token="text_r_12"
                color={colorChips.grayScale[600]}
                sx={lineClamp(1)}
              >
                {club.description}
              </Typo>
              <VerticalGap size={12} />
              <Stack direction="row" spacing={2}>
                {[
                  { label: '멤버', value: club.memberCount },
                  { label: '책', value: club.bookCount },
                  { label: '문집 주문', value: club.orderCount },
                ].map((stat) => (
                  <Stack key={stat.label} direction="row" spacing={0.5}>
                    <Typo token="text_r_12" color={colorChips.grayScale[500]}>
                      {stat.label}
                    </Typo>
                    <Typo token="text_sb_12" color={colorChips.grayScale[800]}>
                      {stat.value}
                    </Typo>
                  </Stack>
                ))}
              </Stack>
              <VerticalGap size={8} />
              <Typo token="text_r_12" color={colorChips.grayScale[400]}>
                {formatDate(club.createdAt)} 개설
              </Typo>
            </Box>
          ))}
        </Box>
      )}
    </CommonContainer>
  );
}
