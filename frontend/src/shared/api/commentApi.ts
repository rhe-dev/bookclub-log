import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type {
  Comment,
  CommentLikeResult,
  CommentThread,
  CreateCommentBody,
  MyComment,
  UpdateCommentBody,
} from '@/shared/types/comment';
import type { Paginated } from '@/shared/types/common';
import { axiosClient } from './axiosClient';

export const commentApi = {
  getComments: async (
    bookPublicId: string,
  ): Promise<Paginated<CommentThread>> => {
    const { data } = await axiosClient.get<Paginated<CommentThread>>(
      `/books/${bookPublicId}/comments`,
      { params: { limit: 100 }, skipErrorToast: true },
    );
    return data;
  },
  createComment: async (
    bookPublicId: string,
    body: CreateCommentBody,
  ): Promise<Comment> => {
    const { data } = await axiosClient.post<Comment>(
      `/books/${bookPublicId}/comments`,
      body,
    );
    return data;
  },
  updateComment: async (
    commentPublicId: string,
    body: UpdateCommentBody,
  ): Promise<Comment> => {
    const { data } = await axiosClient.patch<Comment>(
      `/comments/${commentPublicId}`,
      body,
    );
    return data;
  },
  deleteComment: async (commentPublicId: string): Promise<void> => {
    await axiosClient.del(`/comments/${commentPublicId}`);
  },
  getMyComments: async (page: number): Promise<Paginated<MyComment>> => {
    const { data } = await axiosClient.get<Paginated<MyComment>>(
      '/comments/mine',
      { params: { page, limit: 10 }, skipErrorToast: true },
    );
    return data;
  },
  toggleLike: async (commentPublicId: string): Promise<CommentLikeResult> => {
    const { data } = await axiosClient.post<CommentLikeResult>(
      `/comments/${commentPublicId}/like`,
    );
    return data;
  },
};

export const useCommentsQuery = (bookPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.comments(bookPublicId ?? ''),
    queryFn: () => commentApi.getComments(bookPublicId as string),
    enabled: Boolean(bookPublicId),
  });

/** 코멘트 변경 후 스레드·책 상세(코멘트 수)·책방 목록을 함께 갱신 */
const useInvalidateComments = (bookPublicId?: string) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.comments(bookPublicId ?? ''),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.book(bookPublicId ?? ''),
    });
    // 책방 카드의 코멘트 수 반영 — 클럽 id가 없는 컨텍스트라 책 목록 광역 무효화
    void queryClient.invalidateQueries({ queryKey: queryKeys.booksAll });
    // 마이페이지 '내 코멘트'에도 반영
    void queryClient.invalidateQueries({ queryKey: ['comments', 'mine'] });
  };
};

export const useCreateCommentMutation = (bookPublicId?: string) => {
  const invalidate = useInvalidateComments(bookPublicId);
  return useMutation({
    mutationFn: (body: CreateCommentBody) =>
      commentApi.createComment(bookPublicId as string, body),
    onSuccess: invalidate,
  });
};

export const useUpdateCommentMutation = (bookPublicId?: string) => {
  const invalidate = useInvalidateComments(bookPublicId);
  return useMutation({
    mutationFn: ({
      commentPublicId,
      body,
    }: {
      commentPublicId: string;
      body: UpdateCommentBody;
    }) => commentApi.updateComment(commentPublicId, body),
    onSuccess: invalidate,
  });
};

export const useDeleteCommentMutation = (bookPublicId?: string) => {
  const invalidate = useInvalidateComments(bookPublicId);
  return useMutation({
    mutationFn: (commentPublicId: string) =>
      commentApi.deleteComment(commentPublicId),
    onSuccess: invalidate,
  });
};

export const useToggleLikeMutation = (bookPublicId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentPublicId: string) =>
      commentApi.toggleLike(commentPublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments(bookPublicId ?? ''),
      });
    },
  });
};

/** 내가 쓴 코멘트 — 마이페이지 모아보기 (더보기 페이지네이션) */
export const useMyCommentsInfiniteQuery = (memberPublicId?: string) =>
  useInfiniteQuery({
    queryKey: queryKeys.commentsMine(memberPublicId ?? ''),
    queryFn: ({ pageParam }) => commentApi.getMyComments(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled: Boolean(memberPublicId),
  });
