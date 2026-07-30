'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, IconButton, Stack } from '@mui/material';
import { BookCover } from '@/shared/components/book/BookCover';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import type { Book } from '@/shared/types/book';
import { formatDate, formatPeriod } from '@/shared/utils/date';

interface ReviewStepProps {
  books: Book[];
  /** 수록 순서 변경 — index의 책을 위(-1)/아래(+1)로 */
  onMove: (index: number, direction: -1 | 1) => void;
  /** 서버가 산출한 예상 분량 — 판형 선택의 기준이 된다 (D-035) */
  pageCount?: number;
  /** 짝수 보정으로 들어가는 여백면 */
  blankPages?: number;
  /** 코멘트 없는 책을 한 번에 빼기 */
  onExcludeEmpty: () => void;
}

/** 2단계 — 수록 내용 확인 + 수록 순서 조정 */
export const ReviewStep = ({
  books,
  onMove,
  pageCount,
  blankPages = 0,
  onExcludeEmpty,
}: ReviewStepProps) => {
  const totalComments = books.reduce((sum, b) => sum + b.commentCount, 0);
  const emptyBooks = books.filter((b) => b.commentCount === 0);

  return (
    <Stack spacing={2}>
      <Typo token="text_r_14" color={colorChips.grayScale[600]}>
        총 <b>{books.length}권</b>의 책과 <b>코멘트 {totalComments}개</b>가
        문집에 실려요. 화살표로 수록 순서를 바꿀 수 있어요.
      </Typo>

      {/* 분량은 판형 선택의 기준이라 이 단계에서 먼저 보여준다 */}
      {pageCount !== undefined && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            p: 1.75,
            borderRadius: 1.5,
            backgroundColor: colorChips.primary[100],
          }}
        >
          <Typo
            token="text_sb_16"
            color={colorChips.primary[700]}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            예상 분량 {pageCount}쪽
          </Typo>
          <Typo
            token="text_r_12"
            color={colorChips.grayScale[600]}
            sx={{ wordBreak: 'keep-all' }}
          >
            표지·속표지와 책마다 붙는 표제지를 포함한 쪽수예요
            {/* 여백면이 실제로 들어갈 때만 안내한다 — 짝수면 굳이 설명할 게 없다 */}
            {blankPages > 0 && ' (짝수로 맞추느라 마지막 1쪽은 여백이에요)'}
          </Typo>
        </Stack>
      )}

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
          <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Typo
              token="text_r_14"
              color={colorChips.secondary[700]}
              sx={{ wordBreak: 'keep-all' }}
            >
              코멘트가 없는 책({emptyBooks.map((b) => b.title).join(', ')})이
              포함되어 있어요. 서지 정보만 수록되며, 그대로 진행할 수 있어요.
            </Typo>
            {/* 빼면 분량이 줄어 판형 선택이 달라질 수 있다 — 그래도 한 번에 정리하는 쪽이 편하다 */}
            {emptyBooks.length < books.length && (
              <CommonButton
                label={`코멘트 없는 책 ${emptyBooks.length}권 빼기`}
                size="small"
                buttonColor="tertiary"
                buttonVariant="outlined"
                onClick={onExcludeEmpty}
                // 안내 배너가 이미 채색돼 있어 투명 배경이면 버튼이 묻힌다
                sx={{ backgroundColor: colorChips.basic.white }}
              />
            )}
          </Stack>
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
