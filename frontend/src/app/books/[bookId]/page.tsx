'use client';

// 책 상세 — 서지정보 + 토론 스레드(코멘트·답글, 페이지·인용 앵커) (PLAN 화면 3, F2)
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBookQuery, useDeleteBookMutation } from '@/shared/api/bookApi';
import {
  useCommentsQuery,
  useCreateCommentMutation,
} from '@/shared/api/commentApi';
import { BookFormModal } from '@/shared/components/book/BookFormModal';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonConfirmModal } from '@/shared/components/ui/CommonConfirmModal';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import { BookDetailSkeleton } from './components/BookDetailSkeleton';
import { BookInfoCard } from './components/BookInfoCard';
import { CommentComposer } from './components/CommentComposer';
import { CommentThreadItem } from './components/CommentThreadItem';

export default function BookDetailPage() {
  const router = useRouter();
  const { bookId } = useParams<{ bookId: string }>();
  const session = useRequireMember();
  const bookQuery = useBookQuery(bookId);
  const commentsQuery = useCommentsQuery(bookId);
  const createMutation = useCreateCommentMutation(bookId);
  const deleteBookMutation = useDeleteBookMutation(bookId);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!session) return null;

  const isLeader = session.club.role === 'LEADER';
  const book = bookQuery.data;
  const threads = commentsQuery.data?.items ?? [];
  const commentCount = commentsQuery.data?.meta.totalCount ?? 0;
  const isLoading = bookQuery.isLoading || commentsQuery.isLoading;
  const isError = bookQuery.isError || commentsQuery.isError;

  return (
    <>
      <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 }, gap: 2.5 }}>
        {isError ? (
          <ErrorView
            message="책을 불러오지 못했어요. 삭제되었거나 잘못된 주소일 수 있어요."
            onRetry={() => {
              void bookQuery.refetch();
              void commentsQuery.refetch();
            }}
          >
            <CommonButton
              label="책방으로"
              buttonColor="tertiary"
              onClick={() => router.push(ROUTES.bookshelf)}
            />
          </ErrorView>
        ) : isLoading || !book ? (
          <BookDetailSkeleton />
        ) : (
          <>
            <BookInfoCard
              book={book}
              actionSlot={
                isLeader ? (
                  <>
                    <IconButton
                      aria-label="책 관리 메뉴"
                      onClick={(e) => setMenuAnchor(e.currentTarget)}
                    >
                      <MoreVertRoundedIcon
                        sx={{ fontSize: 20, color: colorChips.grayScale[500] }}
                      />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={() => setMenuAnchor(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          setMenuAnchor(null);
                          setEditOpen(true);
                        }}
                      >
                        책 정보 수정
                      </MenuItem>
                      <MenuItem
                        sx={{ color: colorChips.system.error }}
                        onClick={() => {
                          setMenuAnchor(null);
                          setDeleteOpen(true);
                        }}
                      >
                        책 삭제
                      </MenuItem>
                    </Menu>
                  </>
                ) : undefined
              }
            />

            <Stack spacing={1.5}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'baseline' }}
              >
                <Typo token="text_sb_18">토론</Typo>
                <Typo token="text_m_12" color={colorChips.grayScale[500]}>
                  {commentCount}
                </Typo>
              </Stack>

              <Stack
                sx={{
                  p: { xs: 1.5, md: 2 },
                  // 내부 인풋과 같은 라운드(테마 기본 10px)로 맞춘다
                  borderRadius: 1,
                  backgroundColor: colorChips.basic.white,
                  border: `1px solid ${colorChips.grayScale[200]}`,
                }}
              >
                <CommentComposer
                  submitting={createMutation.isPending}
                  onSubmit={async (values) => {
                    await createMutation.mutateAsync(values);
                    toast.success('코멘트를 남겼어요.');
                  }}
                />
              </Stack>

              {threads.length === 0 ? (
                <Typo
                  token="text_r_14"
                  color={colorChips.grayScale[500]}
                  sx={{ py: 4, textAlign: 'center' }}
                >
                  아직 코멘트가 없어요. 첫 생각을 남겨보세요.
                </Typo>
              ) : (
                <Stack spacing={1.5}>
                  {threads.map((thread) => (
                    <CommentThreadItem
                      key={thread.publicId}
                      thread={thread}
                      bookPublicId={bookId}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </>
        )}
      </CommonContainer>

      {book && (
        <>
          <BookFormModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            clubPublicId={session.club.publicId}
            book={book}
          />
          <CommonConfirmModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            title="책 삭제"
            body={`『${book.title}』을(를) 책방에서 삭제할까요? 토론 기록은 함께 보이지 않게 됩니다.`}
            confirmLabel="삭제"
            confirmColor="error"
            isLoading={deleteBookMutation.isPending}
            onConfirm={() => {
              deleteBookMutation.mutate(undefined, {
                onSuccess: () => {
                  toast.success('책을 삭제했어요.');
                  router.replace(ROUTES.bookshelf);
                },
              });
            }}
          />
        </>
      )}
    </>
  );
}
