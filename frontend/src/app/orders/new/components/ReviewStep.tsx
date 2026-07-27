'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, IconButton, Stack } from '@mui/material';
import { BookCover } from '@/shared/components/book/BookCover';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import type { Book } from '@/shared/types/book';
import { formatDate, formatPeriod } from '@/shared/utils/date';

interface ReviewStepProps {
  books: Book[];
  /** 수록 순서 변경 — index의 책을 위(-1)/아래(+1)로 */
  onMove: (index: number, direction: -1 | 1) => void;
}

/** 2단계 — 수록 내용 확인 + 수록 순서 조정 */
export const ReviewStep = ({ books, onMove }: ReviewStepProps) => {
  const totalComments = books.reduce((sum, b) => sum + b.commentCount, 0);
  const emptyBooks = books.filter((b) => b.commentCount === 0);

  return (
    <Stack spacing={2}>
      <Typo token="text_r_14" color={colorChips.grayScale[600]}>
        총 <b>{books.length}권</b>의 책과 <b>코멘트 {totalComments}개</b>가
        문집에 실려요. 화살표로 수록 순서를 바꿀 수 있어요.
      </Typo>

      {emptyBooks.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'flex-start',
            p: 1.5,
            borderRadius: 1,
            backgroundColor: colorChips.secondary[100],
          }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 18, color: colorChips.secondary[700], mt: '1px' }}
          />
          <Typo
            token="text_r_14"
            color={colorChips.secondary[700]}
            sx={{ wordBreak: 'keep-all' }}
          >
            코멘트가 없는 책({emptyBooks.map((b) => b.title).join(', ')})이
            포함되어 있어요. 서지 정보만 수록되며, 그대로 진행할 수 있어요.
          </Typo>
        </Stack>
      )}

      <Stack
        sx={{
          borderRadius: 1,
          border: `1px solid ${colorChips.grayScale[200]}`,
          backgroundColor: colorChips.basic.white,
          overflow: 'hidden',
        }}
      >
        {books.map((book, index) => {
          const period = formatPeriod(book.periodFrom, book.periodTo);
          const meeting = formatDate(book.meetingDate);
          return (
            <Stack
              key={book.publicId}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                p: 1.5,
                borderTop:
                  index === 0
                    ? 'none'
                    : `1px solid ${colorChips.grayScale[200]}`,
              }}
            >
              <Typo
                token="text_sb_12"
                color={colorChips.grayScale[500]}
                sx={{ width: 18, textAlign: 'center', flexShrink: 0 }}
              >
                {index + 1}
              </Typo>
              <BookCover
                color={book.coverColor}
                emoji={book.coverEmoji}
                width={44}
                fontSize={20}
                borderRadius={1.5}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typo
                  token="text_sb_14"
                  color={colorChips.grayScale[800]}
                  noWrap
                >
                  {book.title}
                </Typo>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[500]}
                  noWrap
                >
                  {book.author}
                </Typo>
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[500]}
                  sx={{ wordBreak: 'keep-all' }}
                >
                  {period && `함께 읽음 ${period}`}
                  {period && meeting && ' · '}
                  {meeting && `모임 ${meeting}`}
                </Typo>
              </Box>
              <Typo
                token="text_m_12"
                color={
                  book.commentCount === 0
                    ? colorChips.system.warning
                    : colorChips.grayScale[600]
                }
                sx={{ flexShrink: 0 }}
              >
                {book.commentCount === 0
                  ? '코멘트 없음'
                  : `코멘트 ${book.commentCount}개`}
              </Typo>
              <Stack sx={{ flexShrink: 0 }}>
                <IconButton
                  size="small"
                  aria-label="위로"
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="아래로"
                  disabled={index === books.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
