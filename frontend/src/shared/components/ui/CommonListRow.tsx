'use client';

import { ButtonBase, type SxProps, type Theme } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';

interface CommonListRowProps {
  onClick: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

/** 보더+호버 리스트 행 버튼 — 모임 목록·계정 선택 등 클릭 가능한 행의 공통 골격 */
export const CommonListRow = ({
  onClick,
  ariaLabel,
  children,
  sx,
}: CommonListRowProps) => (
  <ButtonBase
    onClick={onClick}
    aria-label={ariaLabel}
    sx={[
      {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        textAlign: 'left',
        border: `1px solid ${colorChips.grayScale[200]}`,
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
        '&:hover': {
          borderColor: colorChips.primary[300],
          backgroundColor: colorChips.grayScale[50],
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </ButtonBase>
);
