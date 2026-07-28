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
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { BOOK_STATUS_LABEL } from '@/shared/constants/bookStatus';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { colorChips } from '@/shared/styles/colors';
import type { BookStatus } from '@/shared/types/book';
import { BookCard } from './components/BookCard';
import { BookshelfSkeleton } from './components/BookshelfSkeleton';
import { EmptyBookshelf } from './components/EmptyBookshelf';
import { ReadingBookCard } from './components/ReadingBookCard';

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
  const pagedBooks = shelfQuery.data?.pages.flatMap((page) => page.items) ?? [];
  // 전체 필터에서는 히어로가 READING을 보여주므로 책장 그리드에서는 제외
  const shelfBooks =
    filter === 'ALL'
      ? pagedBooks.filter((b) => b.status !== 'READING')
      : pagedBooks;
  const allTotal = shelfQuery.data?.pages[0]?.meta.totalCount ?? 0;
  const readingTotal = readingQuery.data?.meta.totalCount ?? 0;
  // 책장 카운트 = 그리드에 실제로 나오는 기준 (전체일 땐 READING 제외)
  const shelfCount = filter === 'ALL' ? allTotal - readingTotal : allTotal;

  const isLoading = readingQuery.isLoading || shelfQuery.isLoading;
  const isError = readingQuery.isError || shelfQuery.isError;
  // '빈 책방' 판단은 필터와 무관한 전체 기준 — 필터 결과가 0이어도 CTA는 유지한다
  const collectionEmpty =
    filter === 'ALL' && !isLoading && !isError && allTotal === 0;

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

        {isError ? (
          <ErrorView
            message="책방을 불러오지 못했어요."
            onRetry={() => {
              void readingQuery.refetch();
              void shelfQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <BookshelfSkeleton />
        ) : collectionEmpty ? (
          <EmptyBookshelf
            isLeader={isLeader}
            onAddBook={() => setFormOpen(true)}
          />
        ) : (
          <>
            {filter === 'ALL' && readingBooks.length > 0 && (
              <Stack spacing={1.5}>
                <Typo token="text_sb_18">지금 읽는 책</Typo>
                {readingBooks.map((book) => (
                  <ReadingBookCard key={book.publicId} book={book} />
                ))}
              </Stack>
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
                  <Typo token="text_m_12" color={colorChips.grayScale[500]}>
                    {shelfCount}권
                  </Typo>
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

              {shelfBooks.length === 0 ? (
                <Typo
                  token="text_r_14"
                  color={colorChips.grayScale[500]}
                  sx={{ py: 4, textAlign: 'center' }}
                >
                  {filter === 'ALL'
                    ? '지난 책이 아직 없어요.'
                    : `'${FILTERS.find((f) => f.value === filter)?.label}' 상태의 책이 없어요.`}
                </Typo>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: { xs: 1.5, md: 2 },
                    }}
                  >
                    {shelfBooks.map((book) => (
                      <BookCard key={book.publicId} book={book} />
                    ))}
                  </Box>
                  {shelfQuery.hasNextPage && (
                    <CommonButton
                      label="책 더 보기"
                      buttonColor="tertiary"
                      isLoading={shelfQuery.isFetchingNextPage}
                      onClick={() => void shelfQuery.fetchNextPage()}
                    />
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
