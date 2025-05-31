// src/components/FeedbackSnackbar.tsx
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
}

export function FeedbackSnackbar({
  open,
  message,
  severity,
  onClose,
}: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <MuiAlert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
