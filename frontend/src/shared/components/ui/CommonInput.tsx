'use client';

import { TextField, TextFieldProps } from '@mui/material';

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
      {...textFieldProps}
    />
  );
};
