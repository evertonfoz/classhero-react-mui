// src/hooks/useSnackbar.tsx
import { useState } from 'react';

export function useSnackbar() {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [open, setOpen] = useState(false);

  const showMessage = (msg: string, type: typeof severity = 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const snackbarProps = {
    open,
    message,
    severity,
    onClose: () => setOpen(false),
  };

  return { showMessage, snackbarProps };
}
