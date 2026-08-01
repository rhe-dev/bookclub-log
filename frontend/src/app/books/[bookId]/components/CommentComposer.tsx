'use client';

import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import { ButtonBase, Stack } from '@mui/material';
import { useState } from 'react';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

interface CommentFormValues {
  content: string;
  page: number | null;
  quote: string | null;
}

interface CommentComposerProps {
  placeholder?: string;
  submitLabel?: string;
  initial?: CommentFormValues;
  submitting?: boolean;
  autoFocus?: boolean;
  /** resolve되면 입력을 비운다(새 작성) — 수정·답글은 부모가 닫는다 */
  onSubmit: (values: CommentFormValues) => Promise<unknown>;
  onCancel?: () => void;
}

/** 코멘트 작성/수정 공용 폼 — 페이지·인용 앵커는 접이식 (PLAN F2) */
export const CommentComposer = ({
  placeholder = '이 책에 대한 생각을 남겨보세요',
  submitLabel = '등록',
  initial,
  submitting = false,
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  const [content, setContent] = useState(initial?.content ?? '');
  const [pageStr, setPageStr] = useState(
    initial?.page ? String(initial.page) : '',
  );
  const [quote, setQuote] = useState(initial?.quote ?? '');
  const [showAnchors, setShowAnchors] = useState(
    Boolean(initial?.page || initial?.quote),
  );
  const [errors, setErrors] = useState<{ content?: string; page?: string }>({});

  /** 고치기 시작하면 그 필드의 에러는 즉시 거둔다 */
  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!content.trim()) nextErrors.content = '내용을 입력해 주세요.';
    const page = pageStr ? Number(pageStr) : null;
    if (page !== null && (!Number.isInteger(page) || page < 1))
      nextErrors.page = '페이지는 1 이상의 숫자로 입력해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit({
        content: content.trim(),
        page: showAnchors ? page : null,
        quote: showAnchors && quote.trim() ? quote.trim() : null,
      });
      setContent('');
      setPageStr('');
      setQuote('');
      setShowAnchors(false);
      setErrors({});
    } catch {
      // 실패 시 입력 유지 — 에러는 전역 토스트로 안내됨
    }
  };

  return (
    <Stack spacing={1.5}>
      <CommonInput
        multiline
        minRows={onCancel ? 2 : 3}
        placeholder={placeholder}
        value={content}
        onChange={(e) => {
          clearError('content');
          setContent(e.target.value);
        }}
        errorMessage={errors.content}
        maxLength={10000}
        autoFocus={autoFocus}
        // 장문 입력 시 최대 300px까지만 늘어나고 이후 스크롤
        sx={{
          '& textarea': { maxHeight: 300, overflowY: 'auto !important' },
        }}
      />
      {showAnchors && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <CommonInput
            label="페이지"
            type="number"
            value={pageStr}
            onChange={(e) => {
              clearError('page');
              setPageStr(e.target.value);
            }}
            errorMessage={errors.page}
            sx={{ width: 90, flexShrink: 0 }}
            size="small"
          />
          <CommonInput
            label="인용 문장"
            multiline
            maxRows={4}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            maxLength={1000}
            size="small"
            sx={{ flex: 1 }}
          />
        </Stack>
      )}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <ButtonBase
          onClick={() => setShowAnchors((prev) => !prev)}
          sx={{ borderRadius: 1.5, px: 0.75, py: 0.5, gap: 0.5 }}
        >
          <BookmarkAddOutlinedIcon
            sx={{ fontSize: 16, color: colorChips.grayScale[500] }}
          />
          <Typo token="text_m_12" color={colorChips.grayScale[500]}>
            {showAnchors ? '페이지·인용 닫기' : '페이지·인용 추가'}
          </Typo>
        </ButtonBase>
        <Stack direction="row" spacing={1}>
          {onCancel && (
            <CommonButton
              label="취소"
              buttonColor="tertiary"
              size="small"
              onClick={onCancel}
            />
          )}
          <CommonButton
            label={submitLabel}
            size="small"
            onClick={() => void handleSubmit()}
            isLoading={submitting}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
