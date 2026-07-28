'use client';

import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { BookCover } from '@/shared/components/book/BookCover';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { MyComment } from '@/shared/types/comment';
import { formatDate } from '@/shared/utils/date';

/** 마이페이지 내 코멘트 카드 — 클릭하면 해당 책의 토론으로 이동 */
export const MyCommentCard = ({ comment }: { comment: MyComment }) => {
  const router = useRouter();

  return (
    <ButtonBase
      onClick={() => router.push(ROUTES.bookDetail(comment.book.publicId))}
      aria-label={`『${comment.book.title}』 토론으로 이동`}
      sx={{
        width: '100%',
        display: 'block',
        textAlign: 'left',
        borderRadius: 2,
        border: `1px solid ${colorChips.grayScale[200]}`,
        backgroundColor: colorChips.basic.white,
        p: { xs: 2, md: 2.5 },
        minWidth: 300,
        '&:hover': { borderColor: colorChips.primary[300] },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <BookCover
          color={comment.book.coverColor}
          emoji={comment.book.coverEmoji}
          width={30}
          fontSize={14}
          borderRadius={1}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typo
            token="text_sb_14"
            color={colorChips.grayScale[800]}
            sx={lineClamp(1)}
          >
            {comment.book.title}
          </Typo>
          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            {comment.club.name}
          </Typo>
        </Box>
      </Stack>
      {/* 앵커(페이지 칩·인용 블록)는 토론 스레드와 동일 문법으로 표시 */}
      {(comment.page || comment.quote) && (
        <>
          <VerticalGap size={8} />
          <Stack spacing={0.75}>
            {comment.page && (
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: colorChips.primary[100],
                }}
              >
                <Typo token="text_sb_12" color={colorChips.primary[700]}>
                  p.{comment.page}
                </Typo>
              </Box>
            )}
            {comment.quote && (
              <Box
                sx={{
                  borderLeft: `3px solid ${colorChips.secondary[300]}`,
                  backgroundColor: colorChips.grayScale[50],
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <Typo
                  token="text_r_12"
                  color={colorChips.grayScale[600]}
                  sx={lineClamp(1)}
                >
                  “{comment.quote}”
                </Typo>
              </Box>
            )}
          </Stack>
        </>
      )}
      <VerticalGap size={8} />
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[700]}
        sx={{ ...lineClamp(2), wordBreak: 'keep-all' }}
      >
        {comment.content}
      </Typo>
      <VerticalGap size={8} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typo token="text_r_12" color={colorChips.grayScale[400]}>
          {formatDate(comment.createdAt)}
          {comment.isEdited ? ' · 수정됨' : ''}
        </Typo>
        {comment.likeCount > 0 && (
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
            <FavoriteRoundedIcon
              sx={{ fontSize: 12, color: colorChips.primary[300] }}
            />
            <Typo token="text_r_12" color={colorChips.grayScale[400]}>
              {comment.likeCount}
            </Typo>
          </Stack>
        )}
      </Stack>
    </ButtonBase>
  );
};
