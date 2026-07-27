import { Box, Stack } from '@mui/material';
import { BookCover } from '@/shared/components/book/BookCover';
import { BookSchedule } from '@/shared/components/book/BookSchedule';
import { BookStatusTag } from '@/shared/components/book/BookStatusTag';
import { MemberAvatarGroup } from '@/shared/components/ui/MemberAvatarGroup';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import type { Book } from '@/shared/types/book';

interface BookInfoCardProps {
  book: Book;
  /** 우상단 액션(모임장 메뉴 등) */
  actionSlot?: React.ReactNode;
}

/** 책 상세 상단 — 서지정보·일정·참여 회원 (PLAN 화면 3) */
export const BookInfoCard = ({ book, actionSlot }: BookInfoCardProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: { xs: 2, md: 3 },
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        backgroundColor: colorChips.basic.white,
        border: `1px solid ${colorChips.grayScale[200]}`,
      }}
    >
      {actionSlot && (
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          {actionSlot}
        </Box>
      )}
      <BookCover
        color={book.coverColor}
        emoji={book.coverEmoji}
        width={{ xs: 92, md: 116 }}
        fontSize={{ xs: 40, md: 48 }}
      />

      <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0, py: 0.5, pr: 4 }}>
        <BookStatusTag status={book.status} />
        <Box>
          <Typo
            token="text_b_20"
            color={colorChips.grayScale[800]}
            sx={{ fontSize: { xs: 18, md: 20 } }}
          >
            {book.title}
          </Typo>
          <Typo token="text_r_14" color={colorChips.grayScale[500]}>
            {book.author}
            {book.publisher ? ` · ${book.publisher}` : ''}
          </Typo>
        </Box>

        <BookSchedule
          periodFrom={book.periodFrom}
          periodTo={book.periodTo}
          meetingDate={book.meetingDate}
        />

        {book.participants.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1 }}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <MemberAvatarGroup members={book.participants} size={26} max={6} />
            <Typo
              token="text_m_12"
              color={colorChips.grayScale[500]}
              sx={{ wordBreak: 'keep-all' }}
            >
              함께 읽는 멤버 {book.participants.length}명
            </Typo>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
