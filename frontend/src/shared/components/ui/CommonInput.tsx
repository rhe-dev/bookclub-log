'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';

type CommonInputProps = Omit<TextFieldProps, 'variant' | 'error'> & {
  /** 있으면 에러 상태로 표시하고 helperText 자리에 노출 */
  errorMessage?: string;
  /**
   * 문구 없이 에러 표시만 — 여러 칸이 하나의 메시지를 공유할 때 쓴다.
   * (예: '함께 읽기 시작/끝'은 두 칸이 함께 틀린 것이라 문구를 아래 한 줄로 모은다)
   */
  hasError?: boolean;
  maxLength?: number;
};

export const CommonInput = ({
  errorMessage,
  hasError,
  maxLength,
  helperText,
  slotProps,
  sx,
  ...textFieldProps
}: CommonInputProps) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      error={Boolean(errorMessage) || Boolean(hasError)}
      helperText={errorMessage ?? helperText}
      slotProps={{
        ...slotProps,
        htmlInput: { maxLength, ...slotProps?.htmlInput },
      }}
      sx={[
        {
          // 회색 페이지 배경 위에서 인풋 영역이 또렷하도록 흰 배경
          '& .MuiOutlinedInput-root': {
            backgroundColor: colorChips.basic.white,
          },
          // 헬퍼·에러 문구는 4px만 들여쓰기, 단어 단위 줄바꿈
          '& .MuiFormHelperText-root': {
            marginLeft: '4px',
            marginRight: 0,
            wordBreak: 'keep-all',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...textFieldProps}
    />
  );
};
