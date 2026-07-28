import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type {
  Book,
  BookStatus,
  CreateBookBody,
  UpdateBookBody,
} from '@/shared/types/book';
import type { Paginated } from '@/shared/types/common';
import { axiosClient } from './axiosClient';

export const bookApi = {
  getBook: async (bookPublicId: string): Promise<Book> => {
    const { data } = await axiosClient.get<Book>(`/books/${bookPublicId}`, {
      skipErrorToast: true,
    });
    return data;
  },
  updateBook: async (
    bookPublicId: string,
    body: UpdateBookBody,
  ): Promise<Book> => {
    const { data } = await axiosClient.patch<Book>(
      `/books/${bookPublicId}`,
      body,
    );
    return data;
  },
  deleteBook: async (bookPublicId: string): Promise<void> => {
    await axiosClient.del(`/books/${bookPublicId}`);
  },
  getBooks: async (
    clubPublicId: string,
    status?: BookStatus,
    page = 1,
    limit = 20,
  ): Promise<Paginated<Book>> => {
    const { data } = await axiosClient.get<Paginated<Book>>(
      `/clubs/${clubPublicId}/books`,
      { params: { status, page, limit }, skipErrorToast: true },
    );
    return data;
  },
  createBook: async (
    clubPublicId: string,
    body: CreateBookBody,
  ): Promise<Book> => {
    const { data } = await axiosClient.post<Book>(
      `/clubs/${clubPublicId}/books`,
      body,
    );
    return data;
  },
};

/** 단발 목록 — 문집 만들기 선택 화면 등 전체가 필요한 곳 (limit 최대치) */
export const useBooksQuery = (clubPublicId?: string, status?: BookStatus) =>
  useQuery({
    queryKey: queryKeys.books(clubPublicId ?? '', status),
    queryFn: () => bookApi.getBooks(clubPublicId as string, status, 1, 100),
    enabled: Boolean(clubPublicId),
  });

/** 책방 책장 — 더보기 페이지네이션 */
export const useBooksInfiniteQuery = (
  clubPublicId?: string,
  status?: BookStatus,
) =>
  useInfiniteQuery({
    queryKey: [...queryKeys.books(clubPublicId ?? '', status), 'infinite'],
    queryFn: ({ pageParam }) =>
      bookApi.getBooks(clubPublicId as string, status, pageParam, 12),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled: Boolean(clubPublicId),
  });

export const useBookQuery = (bookPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.book(bookPublicId ?? ''),
    queryFn: () => bookApi.getBook(bookPublicId as string),
    enabled: Boolean(bookPublicId),
  });

export const useCreateBookMutation = (clubPublicId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookBody) =>
      bookApi.createBook(clubPublicId as string, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.booksRoot(clubPublicId ?? ''),
      });
    },
  });
};

export const useUpdateBookMutation = (bookPublicId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBookBody) =>
      bookApi.updateBook(bookPublicId as string, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.book(bookPublicId ?? ''),
      });
      // 책방 목록 카드에도 반영 — 클럽 id가 없는 컨텍스트라 목록 전체 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.booksAll });
    },
  });
};

export const useDeleteBookMutation = (bookPublicId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bookApi.deleteBook(bookPublicId as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.booksAll });
    },
  });
};
