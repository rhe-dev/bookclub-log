'use client';

import { Stack } from '@mui/material';
import { useRef } from 'react';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { colorChips } from '@/shared/styles/colors';

/** 백엔드 검증(@Min 1·@Max 100)과 동일한 범위 */
const MIN_COPIES = 1;
const MAX_COPIES = 100;

interface OrderFormStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  copies: string;
  onCopiesChange: (value: string) => void;
  memberCount: number;
  bookCount: number;
  errors: { title?: string; copies?: string };
}

/** 3단계 — 문집 제목·부수 입력 */
export const OrderFormStep = ({
  title,
  onTitleChange,
  copies,
  onCopiesChange,
  memberCount,
  bookCount,
  errors,
}: OrderFormStepProps) => {
  const copiesInputRef = useRef<HTMLInputElement>(null);

  return (
    <Stack>
      <Typo token="text_r_14" color={colorChips.grayScale[800]}>
        선택한 책 {bookCount}권으로 문집을 만들어요. 표지에 들어갈 제목과 인쇄
        부수를 정해 주세요.
      </Typo>
      <VerticalGap size={32} />
      <CommonInput
        label="문집 제목 *"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          // 한글 조합 중 Enter는 무시
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            copiesInputRef.current?.focus();
          }
        }}
        errorMessage={errors.title}
        maxLength={100}
      />
      <VerticalGap size={20} />
      <CommonInput
        label="인쇄 부수 *"
        type="number"
        inputRef={copiesInputRef}
        value={copies}
        onChange={(e) => onCopiesChange(e.target.value)}
        onKeyDown={(e) => {
          // Enter 시 블러 — 블러 시점에 범위 검증·폴백이 동작한다
          if (e.key === 'Enter') (e.target as HTMLElement).blur();
        }}
        onBlur={() => {
          // 직접 입력한 비정상 값은 유효 범위로 폴백
          const parsed = Number(copies);
          if (!copies || !Number.isInteger(parsed) || parsed < MIN_COPIES) {
            onCopiesChange(String(MIN_COPIES));
          } else if (parsed > MAX_COPIES) {
            onCopiesChange(String(MAX_COPIES));
          }
        }}
        errorMessage={errors.copies}
        helperText={
          errors.copies
            ? undefined
            : `모임 멤버 수만큼 ${memberCount}부를 기본으로 담아뒀어요.`
        }
        slotProps={{ htmlInput: { min: MIN_COPIES, max: MAX_COPIES } }}
        sx={{ maxWidth: 280 }}
      />
      <VerticalGap size={2} />
      <Typo
        token="text_r_12"
        color={colorChips.grayScale[600]}
        sx={{ wordBreak: 'keep-all', pl: 0.5 }}
      >
        * 최대 {MAX_COPIES}부까지 주문할 수 있어요. 그 이상 주문을 원하시면
        고객센터로 문의해 주세요.
      </Typo>
    </Stack>
  );
};
