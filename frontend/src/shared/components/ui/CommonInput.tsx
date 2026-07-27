'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';

type CommonInputProps = Omit<TextFieldProps, 'variant' | 'error'> & {
  /** 있으면 에러 상태로 표시하고 helperText 자리에 노출 */
  errorMessage?: string;
  maxLength?: number;
};

export const CommonInput = ({
  errorMessage,
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
      error={Boolean(errorMessage)}
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
