'use client';

import { Stack } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';
import { CommonButton } from './CommonButton';
import { Typo } from './Typo';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  /** '다시 시도' 옆에 붙는 추가 액션 */
  children?: React.ReactNode;
}

/** 화면 단위 조회 실패 뷰 — 메시지 + 재시도 (QA 루브릭 ③) */
export const ErrorView = ({ message, onRetry, children }: ErrorViewProps) => {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
      <Typo token="text_m_16" color={colorChips.grayScale[600]}>
        {message}
      </Typo>
      <Stack direction="row" spacing={1}>
        <CommonButton
          label="다시 시도"
          buttonVariant="outlined"
          onClick={onRetry}
        />
        {children}
      </Stack>
    </Stack>
  );
};
