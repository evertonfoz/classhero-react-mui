import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';

interface Theme {
  id: string;
  title: string;
  description: string;
}

interface ThemesDialogProps {
  open: boolean;
  onClose: () => void;
  classDisciplineId: string;
  disciplineName?: string;
  teacherName?: string | null;
}

export default function ThemesDialog({
  open,
  onClose,
  classDisciplineId,
  disciplineName,
  teacherName,
}: ThemesDialogProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchThemes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `http://localhost:3000/themes/by-class-discipline/${classDisciplineId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error();
        const { data } = await res.json();
        setThemes(data || []);
      } catch {
        setThemes([]);
      }
    };
    fetchThemes();
  }, [open, classDisciplineId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    const payload = { title, description, class_discipline_id: classDisciplineId };
    try {
      const res = await fetch(
        `http://localhost:3000/themes${editingId ? `/${editingId}` : ''}`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      if (editingId) {
        setThemes((prev) =>
          prev.map((t) => (t.id === editingId ? data : t)),
        );
      } else {
        setThemes((prev) => [...prev, data]);
      }
      resetForm();
    } catch {
      // error handling omitted
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/themes/${deleteId}` , {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setThemes((prev) => prev.filter((t) => t.id !== deleteId));
    } catch {
      // error
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const startEdit = (theme: Theme) => {
    setEditingId(theme.id);
    setTitle(theme.title);
    setDescription(theme.description);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Temas de {disciplineName}
        </Typography>
        {teacherName && (
          <Typography variant="subtitle2">Professor: {teacherName}</Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <List>
          {themes.map((t) => (
            <ListItem
              key={t.id}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => startEdit(t)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setDeleteId(t.id);
                      setConfirmOpen(true);
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={t.title}
                secondary={t.description}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {editingId && (
          <Button onClick={resetForm} variant="outlined" color="inherit">
            Cancelar Edição
          </Button>
        )}
        <Button onClick={onClose} variant="outlined" color="inherit">
          Fechar
        </Button>
        <Button onClick={handleSave} variant="contained">
          {editingId ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tema"
        message="Tem certeza que deseja excluir este tema?"
        confirmColor="error"
      />
    </Dialog>
  );
}

