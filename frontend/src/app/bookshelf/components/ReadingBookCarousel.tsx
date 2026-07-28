'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, IconButton, Stack } from '@mui/material';
import { useRef, useState } from 'react';
import { colorChips } from '@/shared/styles/colors';
import { cardShadow } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';
import { ReadingBookCard } from './ReadingBookCard';

const ARROW_SX = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: colorChips.basic.white,
  border: `1px solid ${colorChips.grayScale[200]}`,
  boxShadow: cardShadow,
  // 모바일은 스와이프가 기본 — 화살표는 데스크탑에서만
  display: { xs: 'none', md: 'inline-flex' },
  '&:hover': { backgroundColor: colorChips.grayScale[50] },
} as const;

/**
 * 지금 읽는 책 캐러셀 — 여러 권이면 드래그·스와이프·화살표·←/→ 키로 넘기고,
 * 양 끝에 복제 슬라이드를 두어 끝없이 순환한다. 한 권이면 카드만 렌더.
 */
export const ReadingBookCarousel = ({ books }: { books: Book[] }) => {
  const count = books.length;
  // 트랙 위치 — 확장 트랙 [마지막 복제, ...books, 첫 복제]에서 1..count가 실제 슬라이드
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const dragStartX = useRef<number | null>(null);
  const dragged = useRef(false);

  if (count === 0) return null;
  if (count === 1) return <ReadingBookCard book={books[0]} />;

  // 목록이 줄어들어도(책 수정·삭제) 트랙 밖을 가리키지 않게 렌더 시점에 클램프
  const trackPos = Math.min(Math.max(pos, 0), count + 1);
  const activeIndex = (((trackPos - 1) % count) + count) % count;

  // 전이 중 연타해도 트랙 범위를 벗어나지 않도록 양 끝(복제 슬라이드)에서 멈춘다
  const go = (direction: 1 | -1) => {
    setAnimate(true);
    setPos(Math.min(Math.max(trackPos + direction, 0), count + 1));
  };

  // 복제 슬라이드에 도착하면 애니메이션 없이 실제 슬라이드로 스냅 — 무한 순환의 핵심
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    // 카드의 box-shadow 전이가 버블링돼 조기 스냅되는 것 방지
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (trackPos === 0) {
      setAnimate(false);
      setPos(count);
    } else if (trackPos === count + 1) {
      setAnimate(false);
      setPos(1);
    }
  };

  // 포인터 이벤트로 마우스 드래그·터치 스와이프를 함께 처리
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragged.current = false;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < 40) return;
    dragged.current = true;
    go(delta < 0 ? 1 : -1);
  };
  // 드래그로 넘긴 직후의 클릭은 카드 이동으로 이어지지 않게 차단
  const handleClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const track = [books[count - 1], ...books, books[0]];

  return (
    <Box
      aria-roledescription="carousel"
      aria-label="지금 읽는 책"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            overflow: 'hidden',
            borderRadius: 3,
            width: '100%',
            // 슬라이드 트랙의 고유 폭이 페이지 최소 폭(fit-content)으로 전파되지 않게 격리
            contain: 'inline-size',
          }}
        >
          <Box
            onTransitionEnd={handleTransitionEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onClickCapture={handleClickCapture}
            // 카드가 링크라 마우스 드래그 시 브라우저의 링크 드래그 고스트가 뜨는 것 방지
            onDragStart={(e) => e.preventDefault()}
            sx={{
              display: 'flex',
              transform: `translateX(-${trackPos * 100}%)`,
              transition: animate ? 'transform 0.35s ease' : 'none',
              touchAction: 'pan-y',
              userSelect: 'none',
            }}
          >
            {track.map((book, index) => (
              <Box
                key={`${book.publicId}-${index}`}
                // 화면 밖 슬라이드(복제 포함)는 스크린리더·탭 이동에서 제외
                aria-hidden={index !== trackPos}
                sx={{
                  flex: '0 0 100%',
                  minWidth: 0,
                  ...(index === trackPos
                    ? {}
                    : { '& a': { pointerEvents: 'none' } }),
                }}
              >
                <ReadingBookCard book={book} disableRipple />
              </Box>
            ))}
          </Box>
        </Box>
        <IconButton
          aria-label="이전 책"
          onClick={() => go(-1)}
          size="small"
          sx={{ ...ARROW_SX, left: -16 }}
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          aria-label="다음 책"
          onClick={() => go(1)}
          size="small"
          sx={{ ...ARROW_SX, right: -16 }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ justifyContent: 'center', pt: 1.25 }}
      >
        {books.map((book, index) => (
          <ButtonBase
            key={book.publicId}
            aria-label={`${index + 1}번째 책 보기`}
            aria-current={index === activeIndex}
            onClick={() => {
              setAnimate(true);
              setPos(index + 1);
            }}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                index === activeIndex
                  ? colorChips.primary[500]
                  : colorChips.grayScale[300],
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};
