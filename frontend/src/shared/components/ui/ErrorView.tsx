'use client';

import { Stack } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';
import { CommonButton } from './CommonButton';
import { Typo } from './Typo';

interface ErrorViewProps {
  message: string;
  /**
   * 없으면 '다시 시도'를 감춘다 — 대상이 없어 실패한 조회처럼
   * 다시 눌러도 결과가 달라지지 않는 경우에는 헛된 버튼을 두지 않는다.
   */
  onRetry?: () => void;
  /** '다시 시도' 옆에 붙는 추가 액션 (돌아갈 곳 등) */
  children?: React.ReactNode;
}

/** 화면 단위 조회 실패 뷰 — 메시지 + 재시도 (QA 루브릭 ③) */
export const ErrorView = ({ message, onRetry, children }: ErrorViewProps) => {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
      <Typo
        token="text_m_16"
        color={colorChips.grayScale[600]}
        align="center"
        sx={{ wordBreak: 'keep-all' }}
      >
        {message}
      </Typo>
      {(onRetry || children) && (
        <Stack direction="row" spacing={1}>
          {onRetry && (
            <CommonButton
              label="다시 시도"
              buttonVariant="outlined"
              onClick={onRetry}
            />
          )}
          {children}
        </Stack>
      )}
    </Stack>
  );
};
