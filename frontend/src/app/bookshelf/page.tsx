'use client';

// 책방(모임 홈) — 지금 읽는 책 + 책장(상태 필터·책 추가·빈 상태) (PLAN 화면 2)
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Chip, Stack } from '@mui/material';
import { useState } from 'react';
import { useBooksQuery } from '@/shared/api/bookApi';
import { useClubsQuery } from '@/shared/api/clubApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { BOOK_STATUS_LABEL } from '@/shared/constants/bookStatus';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { colorChips } from '@/shared/styles/colors';
import type { BookStatus } from '@/shared/types/book';
import { BookFormModal } from '@/shared/components/book/BookFormModal';
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
  const member = useRequireMember();
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const clubsQuery = useClubsQuery();
  const club = clubsQuery.data?.[0];
  const booksQuery = useBooksQuery(
    club?.publicId,
    filter === 'ALL' ? undefined : filter,
  );

  if (!member) return null;

  const isLeader = member.role === 'LEADER';
  const books = booksQuery.data?.items ?? [];
  const readingBooks =
    filter === 'ALL' ? books.filter((b) => b.status === 'READING') : [];
  const shelfBooks =
    filter === 'ALL' ? books.filter((b) => b.status !== 'READING') : books;
  const isLoading = clubsQuery.isLoading || booksQuery.isLoading;
  const isError = clubsQuery.isError || booksQuery.isError;
  const isEmpty = !isLoading && !isError && books.length === 0;

  return (
    <>
      <CommonContainer sx={{ py: { xs: 3, md: 5 }, gap: { xs: 3, md: 4 } }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
            {club ? `${club.name} 책방` : '우리 모임 책방'}
          </Typo>
          {isLeader && !isEmpty && (
            <CommonButton
              label="책 추가"
              startIcon={<AddRoundedIcon />}
              onClick={() => setFormOpen(true)}
            />
          )}
        </Stack>

        {isError ? (
          <ErrorView
            message="책방을 불러오지 못했어요."
            onRetry={() => {
              void clubsQuery.refetch();
              void booksQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <BookshelfSkeleton />
        ) : isEmpty && filter === 'ALL' ? (
          <EmptyBookshelf
            isLeader={isLeader}
            onAddBook={() => setFormOpen(true)}
          />
        ) : (
          <>
            {readingBooks.length > 0 && (
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
                    {booksQuery.data?.meta.totalCount ?? 0}권
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
              )}
            </Stack>
          </>
        )}
      </CommonContainer>

      <BookFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        clubPublicId={club?.publicId}
      />
    </>
  );
}
