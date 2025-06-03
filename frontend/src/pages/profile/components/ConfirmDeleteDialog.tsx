// src/pages/profile/components/ConfirmDeleteDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface Props {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ open, loading, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteOutlineIcon color="error" />
        <Typography variant="h6" component="span" fontWeight="bold">
          Confirmar exclusão
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza de que deseja <strong>excluir este perfil?</strong>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Voltar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          {loading ? 'Excluindo...' : 'Sim, excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
