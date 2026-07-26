'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
} from '@mui/material';

interface CommonModalProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** 하단 버튼 영역 — CommonButton 조합을 넣는다 */
  actions?: React.ReactNode;
  disableBackdropClose?: boolean;
  children?: React.ReactNode;
}

export const CommonModal = ({
  open,
  onClose,
  title,
  actions,
  disableBackdropClose = false,
  children,
  maxWidth = 'sm',
  ...dialogProps
}: CommonModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (disableBackdropClose && reason === 'backdropClick') return;
        onClose();
      }}
      fullWidth
      maxWidth={maxWidth}
      {...dialogProps}
    >
      {title && (
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
          {title}
          <IconButton
            aria-label="닫기"
            onClick={onClose}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};
