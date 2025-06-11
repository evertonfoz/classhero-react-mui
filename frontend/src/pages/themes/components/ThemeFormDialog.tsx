import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface ThemeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing?: boolean;
  initialData?: { title: string; description: string; order: number };

  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  order: number | '';
  setOrder: (val: number | '') => void;
}

export default function ThemeFormDialog({
  open,
  onClose,
  onSubmit,
  isEditing = false,
  initialData,
  title,
  setTitle,
  description,
  setDescription,
  order,
  setOrder,
}: ThemeFormDialogProps) {
  const [hasChanges, setHasChanges] = useState(false);

  const isValid =
    title.trim() !== '' &&
    description.trim() !== '' &&
    order !== '' &&
    !isNaN(Number(order));

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setOrder(initialData.order);
        setHasChanges(false);
      } else {
        setTitle('');
        setDescription('');
        setOrder('');
        setHasChanges(false);
      }
    }
  }, [open, isEditing, initialData]);

  // Detecta se houve alterações nos campos
  useEffect(() => {
    if (isEditing && initialData) {
      const changed =
        title !== initialData.title ||
        description !== initialData.description ||
        order !== initialData.order;
      setHasChanges(changed);
    } else {
      // Se algum campo for alterado (modo criação)
      const filled = title.trim() !== '' || description.trim() !== '' || order !== '';
      setHasChanges(filled);
    }
  }, [title, description, order, isEditing, initialData]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Tema' : 'Novo Tema'}</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Box pt={1}>
          <TextField
            label="Ordem"
            type="number"
            value={order}
            onChange={(e) =>
              setOrder(e.target.value === '' ? '' : Number(e.target.value))
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        {hasChanges ? (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              onClick={onSubmit}
              disabled={!isValid}
              variant="contained"
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="outlined">
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
