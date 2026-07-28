import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import Link from 'next/link';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookSchedule } from '@/shared/components/book/BookSchedule';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { MemberAvatarGroup } from '@/shared/components/ui/MemberAvatarGroup';
import { Typo } from '@/shared/components/ui/Typo';
import { cardShadow } from '@/shared/styles/mixins';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

/** '지금 읽는 책' 히어로 카드 — 표지 + 일정·참여 멤버·코멘트 수 */
export const ReadingBookCard = ({ book }: { book: Book }) => {
  return (
    <ButtonBase
      component={Link}
      href={ROUTES.bookDetail(book.publicId)}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        textAlign: 'left',
        // 극단적으로 좁은 화면에서는 찌그러지는 대신 가로 스크롤
        minWidth: 300,
        gap: { xs: 2, md: 3 },
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        backgroundColor: colorChips.basic.white,
        border: `1px solid ${colorChips.grayScale[200]}`,
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: cardShadow },
      }}
    >
      <BookCover
        color={book.coverColor}
        emoji={book.coverEmoji}
        width={{ xs: 84, md: 104 }}
        fontSize={{ xs: 36, md: 44 }}
      />

      <Stack spacing={1} sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <BookStatusTag status={book.status} />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <ChatBubbleOutlineRoundedIcon
              sx={{ fontSize: 14, color: colorChips.grayScale[500] }}
            />
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              코멘트 {book.commentCount}
            </Typo>
          </Stack>
        </Stack>

        <Box>
          <Typo
            token="text_b_18"
            color={colorChips.grayScale[800]}
            sx={lineClamp(2)}
          >
            {book.title}
          </Typo>
          <Typo token="text_r_14" color={colorChips.grayScale[500]} noWrap>
            {book.author}
            {book.publisher ? ` · ${book.publisher}` : ''}
          </Typo>
        </Box>

        <BookSchedule
          periodFrom={book.periodFrom}
          periodTo={book.periodTo}
          meetingDate={book.meetingDate}
        />

        <Box sx={{ mt: 'auto' }}>
          <MemberAvatarGroup members={book.participants} size={26} max={6} />
        </Box>
      </Stack>
    </ButtonBase>
  );
};
