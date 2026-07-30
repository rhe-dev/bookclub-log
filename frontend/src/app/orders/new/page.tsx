'use client';

// 문집 만들기 — 책 선택 → 수록 확인(분량) → 판형·표지 → 부수·확인 (PLAN F3, 화면 4)
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Stack, Step, StepButton, StepLabel, Stepper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useBooksQuery } from '@/shared/api/bookApi';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import {
  useCreateOrderMutation,
  useOrderEstimateQuery,
} from '@/shared/api/orderApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Order } from '@/shared/types/order';
import { formatPeriodShort } from '@/shared/utils/date';
import { BookSelectStep } from './components/BookSelectStep';
import { CompleteStep } from './components/CompleteStep';
import { ConfirmStep } from './components/ConfirmStep';
import { OrderNewSkeleton } from './components/OrderNewSkeleton';
import { COVER_COLORS, COVER_EMOJIS } from './components/orderSpec';
import { ReviewStep } from './components/ReviewStep';
import { SelectedBooksPanel } from './components/SelectedBooksPanel';
import { SpecCoverStep } from './components/SpecCoverStep';

const STEP_LABELS = ['책 선택', '수록 확인', '판형·표지', '부수·확인'];
const LAST_STEP = STEP_LABELS.length - 1;

export default function OrderNewPage() {
  const router = useRouter();
  const session = useRequireMember();
  const club = session?.club;
  const booksQuery = useBooksQuery(club?.publicId);
  const createMutation = useCreateOrderMutation(club?.publicId);
  // 부수 기본값(멤버 수)용 — 현재 클럽의 멤버 수는 내 클럽 목록에서 찾는다
  const myClubsQuery = useMyClubsQuery(session?.member.publicId);
  const memberCount =
    myClubsQuery.data?.find((c) => c.publicId === club?.publicId)
      ?.memberCount ?? 0;

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [copies, setCopies] = useState('');
  const [bookSpecUid, setBookSpecUid] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [coverEmoji, setCoverEmoji] = useState(COVER_EMOJIS[0]);
  const [errors, setErrors] = useState<{ title?: string; copies?: string }>({});
  /** 분량 미달 안내 — '다음'을 눌렀을 때만 띄우고, 선택이 바뀌면 지운다 */
  const [shortNotice, setShortNotice] = useState<string | null>(null);
  /**
   * 단계별 스크롤 위치.
   * 앞으로 갈 때는 새 내용을 처음부터 보여주고, 뒤로 갈 때는 보던 자리로 돌려놓는다 —
   * '이전'은 새 화면이 아니라 "방금 하던 것을 고치러 가는" 동작이라 위치가 유지되는 쪽이 자연스럽다.
   */
  const scrollByStep = useRef<Record<number, number>>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // 분량·판형별 가능 여부·1부 단가·수령일은 서버가 계산한다 — 화면은 결과만 쓴다 (D-035)
  const estimateQuery = useOrderEstimateQuery(club?.publicId, selectedIds);
  const estimate = estimateQuery.data;

  if (!session || !club) return null;

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

  const selectedSpec = estimate?.specs.find(
    (spec) => spec.bookSpecUid === bookSpecUid,
  );
  // 수록 기간 — 표지에 들어갈 문구
  const coverPeriod = formatPeriodShort(
    selectedBooks[0]?.periodFrom ?? selectedBooks[0]?.meetingDate,
    selectedBooks[selectedBooks.length - 1]?.periodTo ??
      selectedBooks[selectedBooks.length - 1]?.meetingDate,
  );

  const toggleBook = (bookPublicId: string) => {
    setShortNotice(null);
    setSelectedIds((prev) =>
      prev.includes(bookPublicId)
        ? prev.filter((id) => id !== bookPublicId)
        : [...prev, bookPublicId],
    );
    // 수록 책이 바뀌면 분량이 바뀌어 고른 판형이 불가해질 수 있다 — 다시 고르게 한다
    setBookSpecUid('');
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

  const selectAllBooks = () => {
    setShortNotice(null);
    setSelectedIds(
      books.filter((book) => book.status === 'DONE').map((b) => b.publicId),
    );
  };
  const clearSelection = () => {
    setShortNotice(null);
    setSelectedIds([]);
    setBookSpecUid('');
  };
  /** 코멘트가 없는 책은 서지 정보만 실린다 — 원하면 한 번에 뺄 수 있게 */
  const excludeEmptyBooks = () =>
    setSelectedIds((prev) =>
      prev.filter((id) => {
        const book = books.find((b) => b.publicId === id);
        return (book?.commentCount ?? 0) > 0;
      }),
    );

  /** 단계 이동 — 렌더가 끝난 뒤 스크롤을 옮긴다 (복원은 새 내용의 높이가 잡혀야 가능) */
  const moveToStep = (next: number) => {
    scrollByStep.current[step] = window.scrollY;
    setStep(next);
    const target = next > step ? 0 : (scrollByStep.current[next] ?? 0);
    requestAnimationFrame(() => window.scrollTo({ top: target }));
  };

  const goNext = async () => {
    // 수록 책이 확정되는 이 시점에 견적을 한 번만 부른다 (책을 고를 때마다 부르지 않는다)
    if (step === 0) {
      const { data } = await estimateQuery.refetch();
      if (!data) return;
      // 분량이 모자라면 여기서 멈추고, 방금 누른 버튼 옆에서 이유를 알린다
      if (!data.printable) {
        setShortNotice(
          `지금 고른 책으로는 ${data.pageCount}쪽이라 문집을 만들 수 없어요. 가장 작은 판형도 24쪽부터라, 책을 더 담거나 토론을 더 쌓은 뒤에 만들어 주세요.`,
        );
        return;
      }
    }
    if (step === 1) {
      // 판형 단계 진입 — 제목 기본값과 가장 저렴한 제작 가능 판형을 미리 골라 둔다
      if (!title.trim()) setTitle(`${club.name} 문집`);
      if (!bookSpecUid) {
        const cheapest = estimate?.specs
          .filter((spec) => spec.eligible)
          .sort((a, b) => a.unitPrice - b.unitPrice)[0];
        if (cheapest) setBookSpecUid(cheapest.bookSpecUid);
      }
    }
    if (step === 2 && !copies && memberCount > 0) {
      setCopies(String(memberCount));
    }
    moveToStep(step + 1);
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = '문집 제목을 입력해 주세요.';
    if (!copies || !Number.isInteger(Number(copies)) || Number(copies) < 1)
      nextErrors.copies = '부수는 1부 이상의 숫자로 입력해 주세요.';
    setErrors(nextErrors);
    if (nextErrors.title) {
      // 제목은 판형·표지 단계에서 받는다 — 그 단계로 되돌려 보여준다
      moveToStep(2);
      return;
    }
    if (nextErrors.copies) return;

    createMutation.mutate(
      {
        title: title.trim(),
        copies: Number(copies),
        bookIds: selectedIds,
        bookSpecUid,
        coverColor,
        coverEmoji,
      },
      {
        onSuccess: (order) => {
          toast.success('문집 주문이 접수됐어요.');
          setCompletedOrder(order);
        },
      },
    );
  };

  // 다음으로 갈 수 없는 단계 — 이유는 각 단계 화면이 이미 설명하고 있다
  const nextDisabled =
    (step === 0 && selectedIds.length === 0) || (step === 2 && !selectedSpec);

  return (
    <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 }, gap: 2.5 }}>
      {completedOrder ? (
        <CompleteStep order={completedOrder} />
      ) : booksQuery.isError ? (
        <ErrorView
          message="책 목록을 불러오지 못했어요."
          onRetry={() => void booksQuery.refetch()}
        />
      ) : booksQuery.isLoading ? (
        <OrderNewSkeleton />
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
                  <StepButton onClick={() => moveToStep(index)}>
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
              clubName={club.name}
              books={books}
              selectedIds={selectedIds}
              onToggle={toggleBook}
              onSelectAll={selectAllBooks}
              onClearAll={clearSelection}
            />
          )}
          {/* 2~4단계는 견적에 의존한다 — 실패하면 빈 화면 대신 재시도를 보여준다 */}
          {step > 0 && estimateQuery.isError ? (
            <ErrorView
              message="문집 분량을 계산하지 못했어요."
              onRetry={() => void estimateQuery.refetch()}
            />
          ) : null}

          {step === 1 && !estimateQuery.isError && (
            <ReviewStep
              books={selectedBooks}
              onMove={moveSelected}
              pageCount={estimate?.pageCount}
              blankPages={estimate?.blankPages}
              onExcludeEmpty={excludeEmptyBooks}
            />
          )}
          {step === 2 && estimate && !estimateQuery.isError && (
            <SpecCoverStep
              specs={estimate.specs}
              pageCount={estimate.pageCount}
              selectedSpecUid={bookSpecUid}
              onSelectSpec={setBookSpecUid}
              title={title}
              onTitleChange={handleTitleChange}
              coverColor={coverColor}
              onCoverColorChange={setCoverColor}
              coverEmoji={coverEmoji}
              onCoverEmojiChange={setCoverEmoji}
              clubName={club.name}
              period={coverPeriod}
              titleError={errors.title}
            />
          )}
          {step === 3 && estimate && selectedSpec && !estimateQuery.isError && (
            <ConfirmStep
              spec={selectedSpec}
              pageCount={estimate.pageCount}
              books={selectedBooks}
              copies={copies}
              onCopiesChange={handleCopiesChange}
              memberCount={memberCount}
              shippingFee={estimate.shippingFee}
              delivery={estimate.delivery}
              copiesError={errors.copies}
            />
          )}

          <Stack
            sx={{
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              py: 1.5,
              backgroundColor: colorChips.grayScale[100],
              borderTop: `1px solid ${colorChips.grayScale[200]}`,
            }}
          >
            {step === 0 && (
              <SelectedBooksPanel books={selectedBooks} onRemove={toggleBook} />
            )}
            {/*
             * 안내는 '다음' 바로 위에 — 목록 상단에 두면 아래로 스크롤한 상태에서
             * 버튼을 눌렀을 때 화면 밖에 있어 보이지 않는다
             */}
            {shortNotice && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'flex-start',
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 1,
                  backgroundColor: colorChips.secondary[100],
                }}
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 18,
                    color: colorChips.secondary[700],
                    mt: '1px',
                  }}
                />
                <Typo
                  token="text_r_14"
                  color={colorChips.secondary[700]}
                  sx={{ wordBreak: 'keep-all' }}
                >
                  {shortNotice}
                </Typo>
              </Stack>
            )}
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <CommonButton
                label="이전"
                buttonColor="tertiary"
                onClick={() => moveToStep(step - 1)}
                sx={{ visibility: step === 0 ? 'hidden' : 'visible' }}
              />
              {step < LAST_STEP ? (
                <CommonButton
                  label={
                    step === 0 && selectedIds.length > 0
                      ? `${selectedIds.length}권 선택 — 다음`
                      : '다음'
                  }
                  onClick={goNext}
                  disabled={nextDisabled}
                />
              ) : (
                <CommonButton
                  label="주문하기"
                  onClick={handleSubmit}
                  isLoading={createMutation.isPending}
                />
              )}
            </Stack>
          </Stack>
        </>
      )}
    </CommonContainer>
  );
}
