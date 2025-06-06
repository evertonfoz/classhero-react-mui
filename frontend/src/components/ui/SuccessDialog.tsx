import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { SxProps, Theme } from '@mui/material';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  question: React.ReactNode;
  onFinalize: () => void;
  onAgain: () => void;
  finalizeText?: string;
  againText?: string;
  paperSx?: SxProps<Theme>;
}

export default function SuccessDialog({
  open,
  onClose,
  title,
  question,
  onFinalize,
  onAgain,
  finalizeText = 'Finalizar',
  againText = 'Cadastrar outro',
  paperSx,
}: SuccessDialogProps) {
  return (
    <Dialog
      open={open}
      hideBackdrop={false}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onClose();
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          maxWidth: 420,
          ...paperSx,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleOutlineIcon color="success" />
        <Typography variant="h6" component="span" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>{question}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onFinalize}>
          {finalizeText}
        </Button>
        <Button
          variant="contained"
          onClick={onAgain}
          autoFocus
          sx={{ whiteSpace: 'nowrap', minWidth: 160 }}
        >
          {againText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
