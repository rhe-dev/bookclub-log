'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { BookCardMeta } from '@/shared/components/book/BookCardMeta';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

interface BookSelectStepProps {
  books: Book[];
  selectedIds: string[];
  onToggle: (bookPublicId: string) => void;
}

/** 1단계 — 문집에 수록할 책 선택 (완독만 가능, 다중 선택) */
export const BookSelectStep = ({
  books,
  selectedIds,
  onToggle,
}: BookSelectStepProps) => {
  return (
    <Stack spacing={1.5}>
      <Typo token="text_r_14" color={colorChips.grayScale[600]}>
        문집에 실을 책을 골라 주세요. 각 책의 토론 코멘트가 함께 수록되며,
        완독한 책만 수록할 수 있어요.
      </Typo>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: { xs: 1.5, md: 2 },
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
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
