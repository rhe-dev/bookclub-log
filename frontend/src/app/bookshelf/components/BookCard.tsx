import { Box, ButtonBase, Stack } from '@mui/material';
import Link from 'next/link';
import { BookCardMeta } from '@/shared/components/book/BookCardMeta';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

/** 책장 그리드 카드 — 표지(상태 뱃지)·제목·저자·일정·참여자·코멘트 수 */
export const BookCard = ({ book }: { book: Book }) => {
  return (
    <ButtonBase
      component={Link}
      href={ROUTES.bookDetail(book.publicId)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'left',
        borderRadius: 3,
        p: 1,
        gap: 1,
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: colorChips.grayScale[100] },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <BookCover color={book.coverColor} emoji={book.coverEmoji} />
        <Box sx={{ position: 'absolute', top: 8, left: 12 }}>
          <BookStatusTag status={book.status} />
        </Box>
      </Box>
      <Stack spacing={0.75} sx={{ px: 0.5, pb: 0.5 }}>
        <Box>
          <Typo
            token="text_sb_14"
            color={colorChips.grayScale[800]}
            sx={lineClamp(2)}
          >
            {book.title}
          </Typo>
          <Typo token="text_m_12" color={colorChips.grayScale[600]} noWrap>
            {book.author}
          </Typo>
        </Box>
        <BookCardMeta book={book} />
      </Stack>
    </ButtonBase>
  );
};
