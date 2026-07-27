import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { Book, BookStatus, CreateBookBody } from '@/shared/types/book';
import type { Paginated } from '@/shared/types/common';
import { axiosClient } from './axiosClient';

export const bookApi = {
  getBooks: async (
    clubPublicId: string,
    status?: BookStatus,
  ): Promise<Paginated<Book>> => {
    const { data } = await axiosClient.get<Paginated<Book>>(
      `/clubs/${clubPublicId}/books`,
      { params: { status, limit: 60 }, skipErrorToast: true },
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

export const useBooksQuery = (clubPublicId?: string, status?: BookStatus) =>
  useQuery({
    queryKey: queryKeys.books(clubPublicId ?? '', status),
    queryFn: () => bookApi.getBooks(clubPublicId as string, status),
    enabled: Boolean(clubPublicId),
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
