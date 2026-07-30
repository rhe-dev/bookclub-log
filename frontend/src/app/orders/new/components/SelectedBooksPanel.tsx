'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, ButtonBase, Collapse, IconButton, Stack } from '@mui/material';
import { useState } from 'react';
import { BookCover } from '@/shared/components/book/BookCover';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';

interface SelectedBooksPanelProps {
  books: Book[];
  onRemove: (bookPublicId: string) => void;
}

/**
 * 지금까지 고른 책 — 목록을 스크롤해도 따라오는 담긴 목록.
 *
 * 책이 많아지면 위쪽에 고른 책이 화면 밖으로 밀려 "내가 뭘 골랐더라"가 된다.
 * 데스크톱은 오른쪽에 붙여 두고, 모바일은 화면을 가리지 않게 하단에 접어 둔다.
 */
export const SelectedBooksPanel = ({
  books,
  onRemove,
}: SelectedBooksPanelProps) => {
  const [open, setOpen] = useState(false);

  if (books.length === 0) return null;

  const list = (
    <Stack spacing={0.75}>
      {books.map((book, index) => (
        <Stack
          key={book.publicId}
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Typo
            token="text_sb_12"
            color={colorChips.grayScale[400]}
            sx={{ width: 14, flexShrink: 0, textAlign: 'center' }}
          >
            {index + 1}
          </Typo>
          <BookCover
            color={book.coverColor}
            emoji={book.coverEmoji}
            width={24}
            fontSize={12}
            borderRadius={1}
          />
          <Typo
            token="text_r_12"
            color={colorChips.grayScale[700]}
            sx={{ ...lineClamp(1), flex: 1, minWidth: 0 }}
          >
            {book.title}
          </Typo>
          <IconButton
            size="small"
            aria-label={`${book.title} 빼기`}
            onClick={() => onRemove(book.publicId)}
            sx={{ flexShrink: 0 }}
          >
            <CloseRoundedIcon
              sx={{ fontSize: 14, color: colorChips.grayScale[500] }}
            />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );

  return (
    <>
      {/*
       * 데스크톱 — 본문(최대 760px) 바깥 여백에 띄운다.
       * 본문 흐름에 넣으면 책 그리드 폭을 빼앗아 카드가 찌그러진다.
       * 여백이 패널 폭만큼 나오는 넓이(1240px)부터만 보여준다.
       */}
      <Box
        sx={{
          display: 'none',
          '@media (min-width: 1240px)': { display: 'block' },
          position: 'fixed',
          top: 140,
          left: 'calc(50% + 400px)',
          width: 210,
          p: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${colorChips.grayScale[200]}`,
          backgroundColor: colorChips.basic.white,
          maxHeight: 'calc(100vh - 220px)',
          overflowY: 'auto',
          zIndex: 2,
        }}
      >
        <Typo token="text_sb_12" color={colorChips.grayScale[700]}>
          담은 책 {books.length}권
        </Typo>
        <Box sx={{ mt: 1 }}>{list}</Box>
      </Box>

      {/*
       * 좁은 화면 — 하단 고정 바 안에 접어 둔다.
       * 따로 sticky를 걸면 같은 바닥을 두고 안내·버튼과 겹친다.
       */}
      <Box
        sx={{
          display: 'block',
          '@media (min-width: 1240px)': { display: 'none' },
          mb: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${colorChips.grayScale[200]}`,
          backgroundColor: colorChips.basic.white,
        }}
      >
        <ButtonBase
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            width: '100%',
            px: 1.5,
            py: 1,
            justifyContent: 'space-between',
            borderRadius: 1.5,
          }}
        >
          <Typo token="text_sb_12" color={colorChips.grayScale[700]}>
            담은 책 {books.length}권
          </Typo>
          {/* 위로 열리는 패널이라 방향이 반대 — 닫혔을 때 위를 가리킨다 */}
          <ExpandMoreRoundedIcon
            sx={{
              fontSize: 18,
              color: colorChips.grayScale[500],
              transform: open ? 'none' : 'rotate(180deg)',
              transition: 'transform 0.15s',
            }}
          />
        </ButtonBase>
        <Collapse in={open}>
          <Box sx={{ px: 1.5, pb: 1.5, maxHeight: 220, overflowY: 'auto' }}>
            {list}
          </Box>
        </Collapse>
      </Box>
    </>
  );
};
