'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import type { AdminOrderFilters } from '@/shared/api/adminApi';
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/shared/constants/adminOrders';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { ORDER_STATUS_LOG_LABEL } from '@/shared/constants/orderStatus';
import { colorChips } from '@/shared/styles/colors';
import type { AdminClub } from '@/shared/types/club';
import type { OrderStatus } from '@/shared/types/order';

// 드롭다운 배경이 인풋 라운드 밖으로 비치지 않게 입력 영역에만 흰 배경
const FIELD_SX = {
  minWidth: 150,
  '& .MuiOutlinedInput-root': { backgroundColor: colorChips.basic.white },
} as const;

interface AdminOrderFilterBarProps {
  filters: AdminOrderFilters;
  clubs?: AdminClub[];
  onChange: (next: AdminOrderFilters) => void;
  onReset: () => void;
  /** 한 페이지에 볼 건수 */
  pageSize: number;
  onPageSizeChange: (limit: number) => void;
}

/** 주문 관리 필터 — 상태·클럽·기간·검색·정렬 + 처리 대기 토글 */
export const AdminOrderFilterBar = ({
  filters,
  clubs,
  onChange,
  onReset,
  pageSize,
  onPageSizeChange,
}: AdminOrderFilterBarProps) => {
  // 입력 중 매 글자 조회하지 않도록 검색어는 제출(Enter·포커스 아웃) 시점에만 반영
  const [keyword, setKeyword] = useState(filters.q ?? '');
  const [lastAppliedQ, setLastAppliedQ] = useState(filters.q ?? '');
  if ((filters.q ?? '') !== lastAppliedQ) {
    setLastAppliedQ(filters.q ?? '');
    setKeyword(filters.q ?? '');
  }

  const update = (next: Partial<AdminOrderFilters>) =>
    onChange({ ...filters, ...next });

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <TextField
          select
          size="small"
          label="상태"
          value={filters.status ?? 'ALL'}
          onChange={(e) =>
            update({
              status:
                e.target.value === 'ALL'
                  ? undefined
                  : (e.target.value as OrderStatus),
            })
          }
          sx={FIELD_SX}
        >
          <MenuItem value="ALL">전체 상태</MenuItem>
          {(
            Object.entries(ORDER_STATUS_LOG_LABEL) as [OrderStatus, string][]
          ).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="클럽"
          value={filters.clubId ?? 'ALL'}
          onChange={(e) =>
            update({
              clubId: e.target.value === 'ALL' ? undefined : e.target.value,
            })
          }
          sx={FIELD_SX}
        >
          <MenuItem value="ALL">전체 클럽</MenuItem>
          {clubs?.map((club) => (
            <MenuItem key={club.publicId} value={club.publicId}>
              {club.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="정렬"
          value={filters.sort ?? 'latest'}
          onChange={(e) =>
            update({ sort: e.target.value as AdminOrderFilters['sort'] })
          }
          sx={{ ...FIELD_SX, minWidth: 150 }}
        >
          <MenuItem value="latest">주문일 최신순</MenuItem>
          <MenuItem value="oldest">주문일 오래된순</MenuItem>
          <MenuItem value="changed_latest">변경일 최신순</MenuItem>
          <MenuItem value="changed_oldest">변경일 오래된순</MenuItem>
        </TextField>

        <TextField
          size="small"
          placeholder="문집 제목·주문자·주문번호"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update({ q: keyword });
          }}
          onBlur={() => {
            if (keyword !== (filters.q ?? '')) update({ q: keyword });
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
          sx={{ ...FIELD_SX, minWidth: 240 }}
        />
      </Stack>

      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <TextField
          select
          size="small"
          label="표시 건수"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ ...FIELD_SX, minWidth: 120 }}
        >
          {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={size}>
              {size}건씩
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label="주문일 시작"
          value={filters.from ?? ''}
          onChange={(e) => update({ from: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />
        <TextField
          size="small"
          type="date"
          label="주문일 종료"
          value={filters.to ?? ''}
          onChange={(e) => update({ to: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FIELD_SX}
        />
        {/* 운영자의 '오늘 할 일' — 신규 접수·환불/재제작 요청만 */}
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={Boolean(filters.actionRequired)}
                onChange={(e) => update({ actionRequired: e.target.checked })}
              />
            }
            label={
              <Typo token="text_m_14" color={colorChips.grayScale[700]}>
                처리 대기만
              </Typo>
            }
            sx={{ mr: 0 }}
          />
          <Tooltip
            title="신규 접수·환불 요청·재제작 요청만 필터링됩니다."
            placement="top"
            enterTouchDelay={0}
          >
            <IconButton size="small" aria-label="처리 대기 필터 설명">
              <InfoOutlinedIcon
                sx={{ fontSize: 16, color: colorChips.grayScale[400] }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
        <CommonButton
          label="필터 초기화"
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={onReset}
        />
      </Stack>
    </Stack>
  );
};
