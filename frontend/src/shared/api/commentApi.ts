import {
  keepPreviousData,
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

const commentApi = {
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
      { params: { page, limit: MY_COMMENTS_PAGE_SIZE }, skipErrorToast: true },
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

/**
 * 토론 스레드 조회.
 *
 * 여기만 창 포커스 복귀 시 재조회를 켠다(전역 기본값은 off). 코멘트는 실시간 대화가
 * 아니라 각자 속도로 남기는 기록이라 실시간 연결까지는 필요 없지만(D-045),
 * 탭을 옮겼다 돌아왔을 때 남의 새 코멘트가 안 보이는 것은 어색하다.
 * 목록·통계처럼 자주 안 바뀌는 화면까지 같이 켤 이유는 없어 쿼리 단위로 둔다.
 */
export const useCommentsQuery = (bookPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.comments(bookPublicId ?? ''),
    queryFn: () => commentApi.getComments(bookPublicId as string),
    enabled: Boolean(bookPublicId),
    refetchOnWindowFocus: true,
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
    // 책방 카드의 코멘트 수 반영 — 모임 id가 없는 컨텍스트라 책 목록 광역 무효화
    void queryClient.invalidateQueries({ queryKey: queryKeys.booksAll });
    // 마이페이지 '내 코멘트'에도 반영
    void queryClient.invalidateQueries({
      queryKey: queryKeys.commentsMineRoot,
    });
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

export const MY_COMMENTS_PAGE_SIZE = 10;

/** 내가 쓴 코멘트 — 마이페이지 모아보기 (번호 페이지네이션) */
export const useMyCommentsQuery = (memberPublicId?: string, page = 1) =>
  useQuery({
    queryKey: [...queryKeys.commentsMine(memberPublicId ?? ''), page],
    queryFn: () => commentApi.getMyComments(page),
    placeholderData: keepPreviousData,
    enabled: Boolean(memberPublicId),
  });
