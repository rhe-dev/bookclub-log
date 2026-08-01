'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { BookCardMeta } from '@/shared/components/book/BookCardMeta';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

interface BookSelectStepProps {
  books: Book[];
  selectedIds: string[];
  onToggle: (bookPublicId: string) => void;
  clubName: string;
  /** 완독 책 전체 선택 / 전체 해제 */
  onSelectAll: () => void;
  onClearAll: () => void;
}

/** 1단계 — 문집에 수록할 책 선택 (완독만 가능, 다중 선택) */
export const BookSelectStep = ({
  books,
  selectedIds,
  onToggle,
  clubName,
  onSelectAll,
  onClearAll,
}: BookSelectStepProps) => {
  const selectableCount = books.filter((book) => book.status === 'DONE').length;
  const allSelected =
    selectableCount > 0 && selectedIds.length === selectableCount;

  return (
    <Stack spacing={1.5}>
      {/* 멀티 모임이므로 어느 모임의 문집인지 명시 */}
      <Typo token="text_r_14" color={colorChips.grayScale[600]}>
        <Typo
          component="span"
          token="text_sb_14"
          color={colorChips.primary[500]}
        >
          {clubName}
        </Typo>
        의 문집에 실을 책을 골라 주세요. 각 책의 토론 코멘트가 함께 수록되며,
        완독한 책만 수록할 수 있어요.
      </Typo>
      {/* 완독 책이 여러 권이면 한 번에 담는 쪽이 빠르다 — 1주년 전집 같은 주문 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
      >
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          완독 {selectableCount}권 중 {selectedIds.length}권 선택
        </Typo>
        <CommonButton
          label={allSelected ? '전체 해제' : '전체 선택'}
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={allSelected ? onClearAll : onSelectAll}
          disabled={selectableCount === 0}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          // minmax(0, 1fr) — 그냥 1fr이면 noWrap 날짜의 최소 폭이 앞 열을 넓혀 마지막 열이 눌린다
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: { xs: 1.5, md: 2 },
          // 셀을 늘이지 않는다 — 내용 높이가 다른 카드(완독 전 책)에서 남는 공간이
          // 버튼의 기본 세로 정렬과 만나 표지 크기가 달라 보였다
          alignItems: 'start',
        }}
      >
        {books.map((book) => {
          const selected = selectedIds.includes(book.publicId);
          const selectable = book.status === 'DONE';
          return (
            <ButtonBase
              key={book.publicId}
              onClick={() => onToggle(book.publicId)}
              disabled={!selectable}
              aria-pressed={selected}
              sx={{
                opacity: selectable ? 1 : 0.45,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderRadius: 3,
                p: 1,
                gap: 1,
                border: selected
                  ? `2px solid ${colorChips.primary[500]}`
                  : `2px solid transparent`,
                backgroundColor: selected
                  ? colorChips.primary[100]
                  : 'transparent',
                '&:hover': {
                  backgroundColor: selected
                    ? colorChips.primary[100]
                    : colorChips.grayScale[100],
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <BookCover color={book.coverColor} emoji={book.coverEmoji} />
                <Box sx={{ position: 'absolute', top: 8, left: 12 }}>
                  <BookStatusTag status={book.status} />
                </Box>
                {selected && (
                  <CheckCircleRoundedIcon
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: 22,
                      color: colorChips.primary[500],
                      backgroundColor: colorChips.basic.white,
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Box>
              <Stack spacing={0.75} sx={{ px: 0.5, pb: 0.5 }}>
                <Typo
                  token="text_sb_14"
                  color={colorChips.grayScale[800]}
                  sx={lineClamp(2)}
                >
                  {book.title}
                </Typo>
                {selectable ? (
                  <BookCardMeta book={book} />
                ) : (
                  <Typo
                    token="text_m_12"
                    color={colorChips.grayScale[500]}
                    sx={{ wordBreak: 'keep-all' }}
                  >
                    완독 후 수록 가능
                  </Typo>
                )}
              </Stack>
            </ButtonBase>
          );
        })}
      </Box>
    </Stack>
  );
};
