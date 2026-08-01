'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import {
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { AdminOrder } from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';

const COLUMNS = [
  '주문일시',
  '최근 변경',
  '주문번호',
  '상태',
  '모임',
  '주문자',
  '문집 제목',
  '부수',
  '판형·쪽수',
  '금액',
  '',
];

const StatusChip = ({ status }: { status: AdminOrder['status'] }) => {
  const chip = ORDER_STATUS_CHIP[status];
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.25,
        borderRadius: 1,
        backgroundColor: chip.bg,
        border: chip.border ? `1px solid ${chip.border}` : 'none',
      }}
    >
      <Typo token="text_sb_12" color={chip.text} sx={{ whiteSpace: 'nowrap' }}>
        {ORDER_STATUS_LOG_LABEL[status]}
      </Typo>
    </Box>
  );
};

interface AdminOrderTableProps {
  orders: AdminOrder[];
  selectedIds: string[];
  onToggleSelect: (orderPublicId: string) => void;
  onToggleSelectAll: () => void;
  onSelect: (order: AdminOrder) => void;
}

/**
 * 운영자 주문 목록 — 좁은 화면에서도 카드로 바꾸지 않고 테이블 + 가로 스크롤.
 * 운영 화면은 데스크탑 중심이고, 열을 나란히 비교하는 게 목록의 목적이라서다.
 */
export const AdminOrderTable = ({
  orders,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSelect,
}: AdminOrderTableProps) => {
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Box
      sx={{
        overflowX: 'auto',
        width: '100%',
        // 테이블 폭이 페이지 최소 폭(AppShell fit-content)으로 전파되면
        // 스크롤 영역 자체가 넓어져 끝까지 스크롤되지 않는다 — 여기서 격리
        contain: 'inline-size',
      }}
    >
      <Table size="small" sx={{ minWidth: 1400 }}>
        {/* 헤더는 배경과 굵은 아래선으로 본문과 확실히 끊는다 — 열이 많아 눈이 헤맨다 */}
        <TableHead
          sx={{
            // 배경은 TableHead가 아니라 셀에 칠해야 실제로 보인다 (셀이 위에 덮인다)
            '& .MuiTableCell-root': {
              backgroundColor: colorChips.grayScale[200],
              borderBottom: `2px solid ${colorChips.grayScale[300]}`,
            },
          }}
        >
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleSelectAll}
                slotProps={{ input: { 'aria-label': '이 페이지 전체 선택' } }}
              />
            </TableCell>
            {COLUMNS.map((label, index) => (
              <TableCell key={label || `col-${index}`}>
                <Typo
                  token="text_sb_12"
                  color={colorChips.grayScale[600]}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </Typo>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.publicId}
              hover
              selected={selectedIds.includes(order.publicId)}
              onClick={() => onSelect(order)}
              sx={{ cursor: 'pointer' }}
            >
              {/* 체크박스 열은 행 클릭(상세 열기)과 분리 */}
              <TableCell
                padding="checkbox"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(order.publicId)}
                  onChange={() => onToggleSelect(order.publicId)}
                  slotProps={{ input: { 'aria-label': `${order.title} 선택` } }}
                />
              </TableCell>
              <TableCell>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[600]}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {formatDateTime(order.createdAt)}
                </Typo>
              </TableCell>
              <TableCell>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[500]}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {formatDateTime(order.statusChangedAt)}
                </Typo>
              </TableCell>
              {/* 주문번호는 대조용이라 전체를 보여준다 — 다 보이므로 툴팁은 두지 않는다 */}
              <TableCell sx={{ minWidth: 210, maxWidth: 210 }}>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[500]}
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {order.publicId}
                </Typo>
              </TableCell>
              <TableCell>
                <StatusChip status={order.status} />
              </TableCell>
              {/* 이름은 중복될 수 있어 식별자를 툴팁으로 함께 제공 */}
              <TableCell>
                <Tooltip title={`ID ${order.club.publicId}`} placement="top">
                  <span>
                    <Typo token="text_r_14" sx={{ whiteSpace: 'nowrap' }}>
                      {order.club.name}
                    </Typo>
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={`ID ${order.member.publicId}`} placement="top">
                  <span>
                    <Typo token="text_r_14" sx={{ whiteSpace: 'nowrap' }}>
                      {order.member.name}
                    </Typo>
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ maxWidth: 260 }}>
                <Typo token="text_m_14" sx={lineClamp(1)}>
                  {order.title}
                </Typo>
              </TableCell>
              <TableCell>
                <Typo token="text_r_14">{order.copies}</Typo>
              </TableCell>
              <TableCell>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[600]}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {order.bookSpec.name} · {order.pageCount}쪽
                </Typo>
              </TableCell>
              <TableCell>
                <Typo token="text_r_14" sx={{ whiteSpace: 'nowrap' }}>
                  {order.totalAmount.toLocaleString()}원
                </Typo>
              </TableCell>
              <TableCell align="right" sx={{ width: 40 }}>
                <ChevronRightRoundedIcon
                  sx={{ fontSize: 18, color: colorChips.grayScale[400] }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
