import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

import type { SxProps, Theme } from '@mui/material';


interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: React.ReactNode;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  disableCancel?: boolean;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  paperSx?: SxProps<Theme>;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  disableCancel = false,
  confirmColor = 'primary',
  paperSx,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onClose();
        }
      }}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          backgroundColor: '#fefefe',
          boxShadow: 10,
          ...paperSx,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 'bold',
          fontSize: '1.25rem',
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ fontSize: '1rem', color: '#555' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!disableCancel && (
          <Button onClick={onClose} variant="outlined" color="inherit">
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button onClick={onConfirm} variant="contained" color={confirmColor}>
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
