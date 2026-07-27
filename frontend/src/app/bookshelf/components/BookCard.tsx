import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { ButtonBase, Stack } from '@mui/material';
import Link from 'next/link';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

/** 책장 그리드 카드 — 표지(색+이모지)·제목·저자·상태·코멘트 수 */
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
      <BookCover color={book.coverColor} emoji={book.coverEmoji} />
      <Stack spacing={0.5} sx={{ px: 0.5, pb: 0.5 }}>
        <Typo
          token="text_sb_14"
          color={colorChips.grayScale[800]}
          sx={lineClamp(2)}
        >
          {book.title}
        </Typo>
        <Typo token="text_r_12" color={colorChips.grayScale[500]} noWrap>
          {book.author}
        </Typo>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <BookStatusTag status={book.status} />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <ChatBubbleOutlineRoundedIcon
              sx={{ fontSize: 14, color: colorChips.grayScale[500] }}
            />
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              {book.commentCount}
            </Typo>
          </Stack>
        </Stack>
      </Stack>
    </ButtonBase>
  );
};
