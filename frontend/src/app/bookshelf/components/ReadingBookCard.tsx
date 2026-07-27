import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import Link from 'next/link';
import { MemberAvatarGroup } from '@/shared/components/ui/MemberAvatarGroup';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import type { Book } from '@/shared/types/book';
import { formatDate, formatPeriod } from '@/shared/utils/date';
import { BookStatusTag } from './BookStatusTag';

/** '지금 읽는 책' 히어로 카드 — 표지 + 일정·참여 멤버·코멘트 수 */
export const ReadingBookCard = ({ book }: { book: Book }) => {
  const period = formatPeriod(book.periodFrom, book.periodTo);
  const meeting = formatDate(book.meetingDate);

  return (
    <ButtonBase
      component={Link}
      href={ROUTES.bookDetail(book.publicId)}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        textAlign: 'left',
        gap: { xs: 2, md: 3 },
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        backgroundColor: colorChips.basic.white,
        border: `1px solid ${colorChips.grayScale[200]}`,
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 4px 16px rgba(17, 17, 17, 0.08)' },
      }}
    >
      <Box
        sx={{
          width: { xs: 84, md: 104 },
          aspectRatio: '3 / 4',
          borderRadius: 2.5,
          backgroundColor: book.coverColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: 36, md: 44 },
          flexShrink: 0,
        }}
      >
        {book.coverEmoji}
      </Box>

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
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {book.title}
          </Typo>
          <Typo token="text_r_14" color={colorChips.grayScale[500]} noWrap>
            {book.author}
            {book.publisher ? ` · ${book.publisher}` : ''}
          </Typo>
        </Box>

        <Stack spacing={0.25}>
          {period && (
            <Typo token="text_m_12" color={colorChips.grayScale[600]}>
              함께 읽는 기간 {period}
            </Typo>
          )}
          {meeting && (
            <Typo token="text_m_12" color={colorChips.grayScale[600]}>
              모임일 {meeting}
            </Typo>
          )}
        </Stack>

        <Box sx={{ mt: 'auto' }}>
          <MemberAvatarGroup members={book.participants} size={26} max={6} />
        </Box>
      </Stack>
    </ButtonBase>
  );
};
