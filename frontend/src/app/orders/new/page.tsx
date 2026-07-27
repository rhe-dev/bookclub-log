'use client';

// 문집 내보내기 — 책 선택 → 수록 확인 → 제목·부수 → 주문 (PLAN F3, 화면 4)
import {
  Skeleton,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBooksQuery } from '@/shared/api/bookApi';
import { useClubsQuery } from '@/shared/api/clubApi';
import { useCreateOrderMutation } from '@/shared/api/orderApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Order } from '@/shared/types/order';
import { BookSelectStep } from './components/BookSelectStep';
import { CompleteStep } from './components/CompleteStep';
import { OrderFormStep } from './components/OrderFormStep';
import { ReviewStep } from './components/ReviewStep';

const STEP_LABELS = ['책 선택', '수록 확인', '제목·부수'];

export default function OrderNewPage() {
  const router = useRouter();
  const member = useRequireMember();
  const clubsQuery = useClubsQuery();
  const club = clubsQuery.data?.[0];
  const booksQuery = useBooksQuery(club?.publicId);
  const createMutation = useCreateOrderMutation(club?.publicId);

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [copies, setCopies] = useState('');
  const [errors, setErrors] = useState<{ title?: string; copies?: string }>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!member) return null;

  const rawBooks = booksQuery.data?.items ?? [];
  // 완독 책이 앞에 오도록 정렬 (비활성 카드는 뒤로)
  const books = [...rawBooks].sort(
    (a, b) => (a.status === 'DONE' ? 0 : 1) - (b.status === 'DONE' ? 0 : 1),
  );
  const doneBooks = books.filter((b) => b.status === 'DONE');
  // 선택 순서 = 수록 순서 — selectedIds 순서를 보존해 매핑
  const selectedBooks = selectedIds
    .map((id) => books.find((b) => b.publicId === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const isLoading = clubsQuery.isLoading || booksQuery.isLoading;
  const isError = clubsQuery.isError || booksQuery.isError;

  const toggleBook = (bookPublicId: string) => {
    setSelectedIds((prev) =>
      prev.includes(bookPublicId)
        ? prev.filter((id) => id !== bookPublicId)
        : [...prev, bookPublicId],
    );
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleCopiesChange = (value: string) => {
    setCopies(value);
    if (errors.copies) setErrors((prev) => ({ ...prev, copies: undefined }));
  };

  const moveSelected = (index: number, direction: -1 | 1) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const goNext = () => {
    // 3단계 진입 시 기본값 채움 — 제목은 모임 이름, 부수는 멤버 수
    if (step === 1) {
      if (!title.trim() && club) setTitle(`${club.name} 문집`);
      if (!copies && club) setCopies(String(club.memberCount));
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = '문집 제목을 입력해 주세요.';
    const copiesNumber = Number(copies);
    if (!copies || !Number.isInteger(copiesNumber) || copiesNumber < 1)
      nextErrors.copies = '부수는 1부 이상의 숫자로 입력해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createMutation.mutate(
      { title: title.trim(), copies: copiesNumber, bookIds: selectedIds },
      {
        onSuccess: (order) => {
          toast.success('문집 주문이 접수됐어요.');
          setCompletedOrder(order);
        },
      },
    );
  };

  return (
    <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 }, gap: 2.5 }}>
      {completedOrder ? (
        <CompleteStep order={completedOrder} />
      ) : isError ? (
        <ErrorView
          message="책 목록을 불러오지 못했어요."
          onRetry={() => {
            void clubsQuery.refetch();
            void booksQuery.refetch();
          }}
        />
      ) : isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={280} />
        </Stack>
      ) : doneBooks.length === 0 ? (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
          <Typo
            token="text_m_16"
            color={colorChips.grayScale[600]}
            align="center"
            sx={{ wordBreak: 'keep-all' }}
          >
            {books.length === 0
              ? '아직 책방에 책이 없어요. 책을 먼저 추가해 주세요.'
              : '아직 완독한 책이 없어요. 완독한 책이 생기면 문집을 만들 수 있어요.'}
          </Typo>
          <CommonButton
            label="책방으로"
            buttonColor="tertiary"
            onClick={() => router.push(ROUTES.bookshelf)}
          />
        </Stack>
      ) : (
        <>
          <Stepper activeStep={step} alternativeLabel nonLinear>
            {STEP_LABELS.map((label, index) => (
              <Step key={label} completed={index < step}>
                {index < step ? (
                  // 완료한 단계는 클릭해서 되돌아갈 수 있다
                  <StepButton onClick={() => setStep(index)}>
                    {label}
                  </StepButton>
                ) : (
                  <StepLabel>{label}</StepLabel>
                )}
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <BookSelectStep
              books={books}
              selectedIds={selectedIds}
              onToggle={toggleBook}
            />
          )}
          {step === 1 && (
            <ReviewStep books={selectedBooks} onMove={moveSelected} />
          )}
          {step === 2 && (
            <OrderFormStep
              title={title}
              onTitleChange={handleTitleChange}
              copies={copies}
              onCopiesChange={handleCopiesChange}
              memberCount={club?.memberCount ?? 0}
              bookCount={selectedBooks.length}
              errors={errors}
            />
          )}

          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              py: 1.5,
              mt: 1,
              backgroundColor: colorChips.grayScale[100],
              borderTop: `1px solid ${colorChips.grayScale[200]}`,
            }}
          >
            <CommonButton
              label="이전"
              buttonColor="tertiary"
              onClick={() => setStep((prev) => prev - 1)}
              sx={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            />
            {step < 2 ? (
              <CommonButton
                label={
                  step === 0 && selectedIds.length > 0
                    ? `${selectedIds.length}권 선택 — 다음`
                    : '다음'
                }
                onClick={goNext}
                disabled={selectedIds.length === 0}
              />
            ) : (
              <CommonButton
                label="주문하기"
                onClick={handleSubmit}
                isLoading={createMutation.isPending}
              />
            )}
          </Stack>
        </>
      )}
    </CommonContainer>
  );
}
