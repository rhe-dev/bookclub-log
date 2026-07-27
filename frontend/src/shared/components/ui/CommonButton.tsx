'use client';

import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';

interface CommonButtonProps extends Omit<
  ButtonProps,
  'variant' | 'color' | 'children'
> {
  label: string;
  /** filled(기본) | outlined */
  buttonVariant?: 'filled' | 'outlined';
  /** primary(기본) | secondary | error | tertiary(강조 없는 보조 톤) */
  buttonColor?: 'primary' | 'secondary' | 'error' | 'tertiary';
  isLoading?: boolean;
}

export const CommonButton = ({
  label,
  buttonVariant = 'filled',
  buttonColor = 'primary',
  isLoading = false,
  disabled,
  sx,
  ...buttonProps
}: CommonButtonProps) => {
  const isTertiary = buttonColor === 'tertiary';

  return (
    <Button
      variant={buttonVariant === 'filled' ? 'contained' : 'outlined'}
      color={isTertiary ? 'inherit' : buttonColor}
      disabled={disabled || isLoading}
      startIcon={
        isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
      }
      sx={[
        { whiteSpace: 'nowrap', flexShrink: 0 },
        isTertiary &&
          buttonVariant === 'filled' && {
            backgroundColor: colorChips.grayScale[200],
            border: `1px solid ${colorChips.grayScale[300]}`,
            color: colorChips.grayScale[700],
            '&:hover': {
              backgroundColor: colorChips.grayScale[300],
              borderColor: colorChips.grayScale[400],
            },
          },
        isTertiary &&
          buttonVariant === 'outlined' && {
            borderColor: colorChips.grayScale[300],
            color: colorChips.grayScale[700],
            '&:hover': {
              backgroundColor: colorChips.grayScale[50],
              borderColor: colorChips.grayScale[400],
            },
          },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...buttonProps}
    >
      {label}
    </Button>
  );
};
