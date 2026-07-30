'use client';

// 책방(모임 홈) — 지금 읽는 책 + 책장(상태 필터·더보기·책 추가·빈 상태) (PLAN 화면 2)
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import { Box, Chip, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBooksInfiniteQuery, useBooksQuery } from '@/shared/api/bookApi';
import { BookFormModal } from '@/shared/components/book/BookFormModal';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonEmptyState } from '@/shared/components/ui/CommonEmptyState';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { BOOK_STATUS_LABEL } from '@/shared/constants/bookStatus';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { colorChips } from '@/shared/styles/colors';
import type { BookStatus } from '@/shared/types/book';
import { BookCard } from './components/BookCard';
import {
  ReadingHeroSkeleton,
  ShelfGridSkeleton,
} from './components/BookshelfSkeleton';
import { EmptyBookshelf } from './components/EmptyBookshelf';
import { ReadingBookCarousel } from './components/ReadingBookCarousel';

type FilterValue = 'ALL' | BookStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'READING', label: BOOK_STATUS_LABEL.READING },
  { value: 'UPCOMING', label: BOOK_STATUS_LABEL.UPCOMING },
  { value: 'DONE', label: BOOK_STATUS_LABEL.DONE },
];

export default function BookshelfPage() {
  const router = useRouter();
  const session = useRequireMember();
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const club = session?.club;
  // 히어로(지금 읽는 책)는 별도 조회 — 책장 페이지네이션과 무관하게 항상 보이도록
  const readingQuery = useBooksQuery(club?.publicId, 'READING');
  const shelfQuery = useBooksInfiniteQuery(
    club?.publicId,
    filter === 'ALL' ? undefined : filter,
  );

  if (!session || !club) return null;

  const isLeader = club.role === 'LEADER';
  const readingBooks = readingQuery.data?.items ?? [];
  // '전체'는 말 그대로 전체 — 읽는 중 책도 히어로(강조)와 그리드(아카이브)에 모두 노출
  const shelfBooks = shelfQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const shelfCount = shelfQuery.data?.pages[0]?.meta.totalCount ?? 0;

  // 히어로는 최초 1회만 로딩, 책장은 필터가 바뀔 때마다 로딩 — 스켈레톤·에러를 영역별로 분리
  const heroLoading = readingQuery.isLoading;
  const shelfLoading = shelfQuery.isLoading;
  // '빈 책방' 판단은 필터와 무관한 전체 기준 — 필터 결과가 0이어도 CTA는 유지한다
  const collectionEmpty =
    filter === 'ALL' &&
    !shelfLoading &&
    !shelfQuery.isError &&
    shelfCount === 0;

  return (
    <>
      <CommonContainer sx={{ py: { xs: 3, md: 5 }, gap: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typo
            token="text_b_24"
            sx={{ fontSize: { xs: 20, md: 24 }, wordBreak: 'keep-all' }}
          >
            <Typo
              component="span"
              token="text_b_24"
              color={colorChips.primary[500]}
              sx={{ fontSize: { xs: 20, md: 24 } }}
            >
              {club.name}
            </Typo>{' '}
            책방
          </Typo>
          <Stack direction="row" spacing={1}>
            {!collectionEmpty && (
              <CommonButton
                label="문집 만들기"
                buttonColor="secondary"
                startIcon={<AutoStoriesRoundedIcon />}
                onClick={() => router.push(ROUTES.orderNew)}
              />
            )}
            {isLeader && !collectionEmpty && (
              <CommonButton
                label="책 추가"
                startIcon={<AddRoundedIcon />}
                onClick={() => setFormOpen(true)}
              />
            )}
          </Stack>
        </Stack>

        {collectionEmpty ? (
          <EmptyBookshelf
            isLeader={isLeader}
            onAddBook={() => setFormOpen(true)}
          />
        ) : (
          <>
            {/* 히어로는 필터와 무관하게 항시 고정 — 여러 권이면 순환 캐러셀 */}
            {heroLoading ? (
              <ReadingHeroSkeleton />
            ) : readingQuery.isError ? (
              <ErrorView
                message="지금 읽는 책을 불러오지 못했어요."
                onRetry={() => void readingQuery.refetch()}
              />
            ) : (
              readingBooks.length > 0 && (
                <Stack spacing={1.5}>
                  <Typo token="text_sb_18">지금 읽는 책</Typo>
                  <ReadingBookCarousel books={readingBooks} />
                </Stack>
              )
            )}

            <Stack spacing={1.5}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'baseline' }}
                >
                  <Typo token="text_sb_18">우리 책장</Typo>
                  {!shelfLoading && (
                    <Typo token="text_m_12" color={colorChips.grayScale[500]}>
                      {shelfCount}권
                    </Typo>
                  )}
                </Stack>
                <Stack direction="row" spacing={1}>
                  {FILTERS.map(({ value, label }) => (
                    <Chip
                      key={value}
                      label={label}
                      size="small"
                      onClick={() => setFilter(value)}
                      color={filter === value ? 'primary' : 'default'}
                      variant={filter === value ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Stack>

              {shelfLoading ? (
                <ShelfGridSkeleton />
              ) : shelfQuery.isError ? (
                <ErrorView
                  message="책장을 불러오지 못했어요."
                  onRetry={() => void shelfQuery.refetch()}
                />
              ) : shelfBooks.length === 0 ? (
                // 전체 필터에서 0권이면 위쪽 빈 책방 온보딩으로 빠지므로 여기는 필터 결과 안내만
                <CommonEmptyState
                  message={`'${FILTERS.find((f) => f.value === filter)?.label}' 상태의 책이 없어요.`}
                  py={4}
                />
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      // minmax(0, 1fr) — 그냥 1fr이면 긴 제목·날짜의 최소 폭이 열을 넓힌다
                      gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(3, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: { xs: 1.5, md: 2 },
                      // 제목이 두 줄인 카드가 섞이면 행 높이에 맞춰 늘어나며 표지 위치가 어긋난다
                      alignItems: 'start',
                    }}
                  >
                    {shelfBooks.map((book) => (
                      <BookCard key={book.publicId} book={book} />
                    ))}
                  </Box>
                  {shelfQuery.hasNextPage && (
                    <Stack sx={{ alignItems: 'center' }}>
                      <CommonButton
                        label="책 더 보기"
                        buttonColor="tertiary"
                        isLoading={shelfQuery.isFetchingNextPage}
                        onClick={() => void shelfQuery.fetchNextPage()}
                        sx={{ px: 5 }}
                      />
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </>
        )}
      </CommonContainer>

      <BookFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        clubPublicId={club.publicId}
      />
    </>
  );
}
