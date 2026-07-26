'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton } from '@mui/material';
import { createPortal } from 'react-dom';
import { colorChips } from '@/shared/styles/colors';
import {
  TOAST_EXIT_DURATION,
  ToastItem,
  ToastType,
  useToastStore,
} from '@/shared/stores/toastStore';
import { Typo } from './Typo';

const TOAST_ICON_COLORS: Record<ToastType, string> = {
  success: colorChips.system.success,
  error: colorChips.system.error,
  info: colorChips.primary[500],
};

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckRoundedIcon sx={{ fontSize: 14 }} />,
  error: <CloseRoundedIcon sx={{ fontSize: 14 }} />,
  info: <InfoOutlinedIcon sx={{ fontSize: 14 }} />,
};

const ToastRow = ({ toast }: { toast: ToastItem }) => {
  const dismissToast = useToastStore((s) => s.dismissToast);

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: 2.5,
        pr: 1.5,
        py: 1.5,
        borderRadius: 2,
        backgroundColor: colorChips.grayScale[800],
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
        pointerEvents: 'auto',
        maxWidth: 420,
        animation: toast.isExiting
          ? `toast-slide-out ${TOAST_EXIT_DURATION}ms ease forwards`
          : 'toast-slide-in 300ms ease',
        '@keyframes toast-slide-in': {
          from: { transform: 'translateY(24px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        '@keyframes toast-slide-out': {
          from: { transform: 'translateY(0)', opacity: 1 },
          to: { transform: 'translateY(24px)', opacity: 0 },
        },
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: TOAST_ICON_COLORS[toast.type],
          color: colorChips.basic.white,
        }}
      >
        {TOAST_ICONS[toast.type]}
      </Box>
      <Typo token="text_m_14" color={colorChips.basic.white} sx={{ flex: 1 }}>
        {toast.message}
      </Typo>
      <IconButton
        aria-label="닫기"
        size="small"
        onClick={() => dismissToast(toast.id)}
        sx={{ color: colorChips.grayScale[400] }}
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};

/** 전역 토스트 — Providers에 1회 마운트. 호출은 toast.success()/error()/info() */
export const CommonToast = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (typeof document === 'undefined' || toasts.length === 0) return null;

  return createPortal(
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
        px: 2.5,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </Box>,
    document.body,
  );
};
