'use client';

import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Stack } from '@mui/material';
import { MemberAvatarGroup } from '@/shared/components/ui/MemberAvatarGroup';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import type { Book } from '@/shared/types/book';
import { formatDateShort, formatPeriodShort } from '@/shared/utils/date';

/** 책 카드 하단 공통 메타 — 기간·모임일 + 참여자 아바타(+N)·코멘트 수 */
export const BookCardMeta = ({ book }: { book: Book }) => {
  const period = formatPeriodShort(book.periodFrom, book.periodTo);
  const meeting = formatDateShort(book.meetingDate);

  return (
    <Stack spacing={0.75}>
      {(period || meeting) && (
        <Stack spacing={0.25}>
          {period && (
            <Typo token="text_r_12" color={colorChips.grayScale[500]} noWrap>
              함께 읽음 {period}
            </Typo>
          )}
          {meeting && (
            <Typo token="text_r_12" color={colorChips.grayScale[500]} noWrap>
              모임 {meeting}
            </Typo>
          )}
        </Stack>
      )}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <MemberAvatarGroup members={book.participants} size={20} max={3} />
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <ChatBubbleOutlineRoundedIcon
            sx={{ fontSize: 14, color: colorChips.grayScale[500] }}
          />
          <Typo token="text_m_10" color={colorChips.grayScale[500]}>
            {book.commentCount}
          </Typo>
        </Stack>
      </Stack>
    </Stack>
  );
};
