'use client';

// 운영자 회원 관리 — 조회 + 메모만 (D-030 개정). 비즈니스 로직은 문집 주문 한 축에 모은다
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Chip,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  useAdminClubsQuery,
  useAdminMembersQuery,
} from '@/shared/api/adminApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonEmptyState } from '@/shared/components/ui/CommonEmptyState';
import { CommonPagination } from '@/shared/components/ui/CommonPagination';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/shared/constants/adminOrders';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { colorChips } from '@/shared/styles/colors';
import { useAdminMemberParams } from '../adminListParams';
import { AdminMemberTable } from './components/AdminMemberTable';

// 드롭다운 배경이 인풋 라운드 밖으로 비치지 않게 입력 영역에만 흰 배경
const FIELD_SX = {
  minWidth: 150,
  '& .MuiOutlinedInput-root': { backgroundColor: colorChips.basic.white },
} as const;

export default function AdminMembersPage() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  // 필터는 URL 쿼리가 단일 소스 — 조합을 링크로 공유할 수 있어야 한다
  const {
    clubId,
    q,
    from,
    to,
    page,
    limit: pageSize,
    search,
    setPeriod,
    clearClub,
    reset,
    setPage,
    setLimit: setPageSize,
  } = useAdminMemberParams();
  const [keyword, setKeyword] = useState(q ?? '');

  const membersQuery = useAdminMembersQuery(page, pageSize, {
    clubId,
    q,
    from,
    to,
  });
  const clubsQuery = useAdminClubsQuery();

  if (!isAdmin) return null;

  const members = membersQuery.data?.items ?? [];
  const totalCount = membersQuery.data?.meta.totalCount ?? 0;
  const activeClub = clubsQuery.data?.find((club) => club.publicId === clubId);

  return (
    <CommonContainer maxWidth={1400} sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
          회원 관리
        </Typo>
        <Typo token="text_m_14" color={colorChips.grayScale[500]}>
          {totalCount}명
        </Typo>
      </Stack>
      <VerticalGap size={4} />
      <Typo token="text_r_12" color={colorChips.grayScale[500]}>
        회원 정보는 조회만 합니다. 응대 기록은 회원 상세의 운영자 메모에 남겨
        주세요.
      </Typo>

      <VerticalGap size={16} />
      <Stack
        direction="row"
        // 좁은 화면에선 줄바꿈이 잦아 세로 간격을 넉넉히
        sx={{ flexWrap: 'wrap', gap: { xs: 1.5, md: 1 } }}
      >
        {/* 이름·회원 ID·클럽명을 한 필드로 — 클럽이 늘어날수록 드롭다운은 감당이 안 된다 */}
        <TextField
          size="small"
          placeholder="이름·회원 ID·클럽명·클럽 ID"
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
          label="가입일 시작"
          value={from ?? ''}
          onChange={(e) => setPeriod({ from: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />
        <TextField
          size="small"
          type="date"
          label="가입일 종료"
          value={to ?? ''}
          onChange={(e) => setPeriod({ to: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />

        <TextField
          select
          size="small"
          label="표시 건수"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          sx={{ ...FIELD_SX, minWidth: 120 }}
        >
          {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={size}>
              {size}건씩
            </MenuItem>
          ))}
        </TextField>
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

      {/* 클럽 상세에서 넘어온 좁히기 — 지우면 전체 회원으로 돌아간다 */}
      {clubId && (
        <>
          <VerticalGap size={12} />
          <Chip
            label={`클럽 · ${activeClub?.name ?? clubId}`}
            onDelete={clearClub}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          />
        </>
      )}

      <VerticalGap size={16} />
      {membersQuery.isError ? (
        <ErrorView
          message="회원 목록을 불러오지 못했어요."
          onRetry={() => void membersQuery.refetch()}
        />
      ) : membersQuery.isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={52} />
          ))}
        </Stack>
      ) : members.length === 0 ? (
        <CommonEmptyState message="조건에 맞는 회원이 없어요." />
      ) : (
        <AdminMemberTable
          members={members}
          onSelect={(member) =>
            router.push(ROUTES.adminMemberDetail(member.publicId))
          }
        />
      )}

      <CommonPagination
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        onChange={setPage}
      />
    </CommonContainer>
  );
}
