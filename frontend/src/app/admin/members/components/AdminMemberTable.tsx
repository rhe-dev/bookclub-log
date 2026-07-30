'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { AdminMember } from '@/shared/types/member';
import { formatDate } from '@/shared/utils/date';

const COLUMNS = ['회원', '가입 클럽', '코멘트', '문집 주문', '가입일', ''];

/** 회원 목록 — 주문 관리와 같은 테이블 문법 (좁은 화면에서도 가로 스크롤, D-031) */
export const AdminMemberTable = ({
  members,
  onSelect,
}: {
  members: AdminMember[];
  onSelect: (member: AdminMember) => void;
}) => (
  <Box sx={{ overflowX: 'auto', width: '100%', contain: 'inline-size' }}>
    <Table size="small" sx={{ minWidth: 860 }}>
      <TableHead
        sx={{
          '& .MuiTableCell-root': {
            backgroundColor: colorChips.grayScale[200],
            borderBottom: `2px solid ${colorChips.grayScale[300]}`,
          },
        }}
      >
        <TableRow>
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
        {members.map((member) => (
          <TableRow
            key={member.publicId}
            hover
            onClick={() => onSelect(member)}
            sx={{ cursor: 'pointer' }}
          >
            <TableCell>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: member.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {member.avatarEmoji}
                </Box>
                <Typo token="text_m_14" sx={{ whiteSpace: 'nowrap' }}>
                  {member.name}
                </Typo>
                {/* 메모가 있으면 응대 이력이 있다는 뜻 — 목록에서 바로 보이게 */}
                {member.hasAdminNote && (
                  <Tooltip title="운영자 메모 있음" placement="top">
                    <StickyNote2OutlinedIcon
                      sx={{ fontSize: 15, color: colorChips.secondary[500] }}
                    />
                  </Tooltip>
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 280 }}>
              <Typo
                token="text_r_12"
                color={colorChips.grayScale[600]}
                sx={lineClamp(1)}
              >
                {member.clubs.length === 0
                  ? '-'
                  : member.clubs
                      .map(
                        (club) =>
                          `${club.name}${club.role === 'LEADER' ? ' (모임장)' : ''}`,
                      )
                      .join(' · ')}
              </Typo>
            </TableCell>
            <TableCell>
              <Typo token="text_r_14">{member.commentCount}</Typo>
            </TableCell>
            <TableCell>
              <Typo token="text_r_14">{member.orderCount}</Typo>
            </TableCell>
            <TableCell>
              <Typo
                token="text_r_12"
                color={colorChips.grayScale[500]}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {formatDate(member.createdAt)}
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
