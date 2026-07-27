'use client';

import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { useState } from 'react';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeMutation,
  useUpdateCommentMutation,
} from '@/shared/api/commentApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Comment, CommentThread } from '@/shared/types/comment';
import { formatDateTime } from '@/shared/utils/date';
import { CommentComposer } from './CommentComposer';

const TextAction = ({
  label,
  color = colorChips.grayScale[500],
  onClick,
}: {
  label: string;
  color?: string;
  onClick: () => void;
}) => (
  <ButtonBase
    onClick={onClick}
    sx={{ borderRadius: 1, px: 0.5, py: 0.25, '&:hover': { opacity: 0.7 } }}
  >
    <Typo token="text_m_12" color={color}>
      {label}
    </Typo>
  </ButtonBase>
);

interface CommentEntryProps {
  comment: Comment;
  bookPublicId: string;
  isReply?: boolean;
  onReplyClick?: () => void;
}

/** 코멘트 1건 — 삭제 자리 유지·앵커·작성자 액션(수정/삭제) */
const CommentEntry = ({
  comment,
  bookPublicId,
  isReply = false,
  onReplyClick,
}: CommentEntryProps) => {
  const member = useMemberStore((s) => s.member);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateMutation = useUpdateCommentMutation(bookPublicId);
  const deleteMutation = useDeleteCommentMutation(bookPublicId);
  const likeMutation = useToggleLikeMutation(bookPublicId);

  if (comment.deleted) {
    return (
      <Typo token="text_r_14" color={colorChips.grayScale[400]} sx={{ py: 1 }}>
        삭제된 코멘트입니다.
      </Typo>
    );
  }

  const isAuthor = member?.publicId === comment.member?.publicId;
  const avatarSize = isReply ? 26 : 32;

  if (editing) {
    return (
      <Box sx={{ py: 1 }}>
        <CommentComposer
          initial={{
            content: comment.content ?? '',
            page: comment.page,
            quote: comment.quote,
          }}
          submitLabel="저장"
          submitting={updateMutation.isPending}
          autoFocus
          onSubmit={async (values) => {
            await updateMutation.mutateAsync({
              commentPublicId: comment.publicId,
              body: values,
            });
            toast.success('코멘트를 수정했어요.');
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1.25} sx={{ py: 1 }}>
      <MemberAvatar
        color={comment.member?.color ?? ''}
        emoji={comment.member?.avatarEmoji ?? ''}
        size={avatarSize}
      />
      <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
        >
          <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
            {comment.member?.name}
          </Typo>
          <Typo token="text_r_12" color={colorChips.grayScale[400]}>
            {formatDateTime(comment.createdAt)}
            {comment.isEdited ? ' · 수정됨' : ''}
          </Typo>
        </Stack>

        {(comment.page || comment.quote) && (
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
                  py: 1,
                }}
              >
                <Typo token="text_r_14" color={colorChips.grayScale[600]}>
                  “{comment.quote}”
                </Typo>
              </Box>
            )}
          </Stack>
        )}

        <Typo
          token="text_r_14"
          color={colorChips.grayScale[800]}
          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {comment.content}
        </Typo>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ButtonBase
            onClick={() => likeMutation.mutate(comment.publicId)}
            disabled={likeMutation.isPending}
            aria-label={comment.likedByMe ? '공감 취소' : '공감'}
            sx={{ borderRadius: 1, px: 0.5, py: 0.25, gap: 0.25 }}
          >
            {comment.likedByMe ? (
              <FavoriteRoundedIcon
                sx={{ fontSize: 15, color: colorChips.primary[500] }}
              />
            ) : (
              <FavoriteBorderRoundedIcon
                sx={{ fontSize: 15, color: colorChips.grayScale[500] }}
              />
            )}
            {comment.likeCount > 0 && (
              <Typo
                token="text_m_12"
                color={
                  comment.likedByMe
                    ? colorChips.primary[500]
                    : colorChips.grayScale[500]
                }
              >
                {comment.likeCount}
              </Typo>
            )}
          </ButtonBase>
          {onReplyClick && <TextAction label="답글" onClick={onReplyClick} />}
          {isAuthor && (
            <>
              <TextAction label="수정" onClick={() => setEditing(true)} />
              <TextAction
                label="삭제"
                color={colorChips.system.error}
                onClick={() => setDeleteOpen(true)}
              />
            </>
          )}
        </Stack>
      </Stack>

      <CommonModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="코멘트 삭제"
        maxWidth="xs"
        actions={
          <>
            <CommonButton
              label="취소"
              buttonColor="tertiary"
              onClick={() => setDeleteOpen(false)}
            />
            <CommonButton
              label="삭제"
              buttonColor="error"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(comment.publicId, {
                  onSuccess: () => {
                    toast.success('코멘트를 삭제했어요.');
                    setDeleteOpen(false);
                  },
                });
              }}
            />
          </>
        }
      >
        <Typo token="text_r_14" color={colorChips.grayScale[600]}>
          코멘트를 삭제할까요? 답글이 있으면 자리는 남고 내용만 지워집니다.
        </Typo>
      </CommonModal>
    </Stack>
  );
};

interface CommentThreadItemProps {
  thread: CommentThread;
  bookPublicId: string;
}

/** 코멘트 + 답글 1단계 스레드 */
export const CommentThreadItem = ({
  thread,
  bookPublicId,
}: CommentThreadItemProps) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const createMutation = useCreateCommentMutation(bookPublicId);
  const canReply = !thread.deleted;

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${colorChips.grayScale[200]}`,
        pb: 1.5,
      }}
    >
      <CommentEntry
        comment={thread}
        bookPublicId={bookPublicId}
        onReplyClick={canReply ? () => setReplyOpen((p) => !p) : undefined}
      />

      {(thread.replies.length > 0 || replyOpen) && (
        <Stack
          spacing={0.5}
          sx={{
            ml: { xs: 3, md: 5 },
            pl: 1.5,
            borderLeft: `2px solid ${colorChips.grayScale[200]}`,
          }}
        >
          {thread.replies.map((reply) => (
            <CommentEntry
              key={reply.publicId}
              comment={reply}
              bookPublicId={bookPublicId}
              isReply
            />
          ))}
          {replyOpen && (
            <Box sx={{ py: 1 }}>
              <CommentComposer
                placeholder="답글을 남겨보세요"
                submitting={createMutation.isPending}
                autoFocus
                onSubmit={async (values) => {
                  await createMutation.mutateAsync({
                    ...values,
                    parentId: thread.publicId,
                  });
                  toast.success('답글을 남겼어요.');
                  setReplyOpen(false);
                }}
                onCancel={() => setReplyOpen(false)}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};
