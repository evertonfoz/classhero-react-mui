import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit, Delete, ArrowBack, Add } from '@mui/icons-material';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { enqueueSnackbar } from 'notistack';

interface Theme {
  id: string;
  title: string;
  description: string;
}

export default function ThemesPage() {
  const { classId, classDisciplineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { disciplineName, teacherName, classCode } = location.state || {};

  const [themes, setThemes] = useState<Theme[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `http://localhost:3000/themes/by-class-discipline/${classDisciplineId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { data } = await res.json();

        setThemes((data || []).map((t: any) => ({
          id: t.theme_id || t.id,
          title: t.title,
          description: t.description
        })));
      } catch (err) {
        console.error('Erro ao carregar temas:', err);
      }
    };

    if (classDisciplineId) fetchThemes();
  }, [classDisciplineId]);

  const handleOpenCreateDialog = () => {
    setEditingTheme(null);
    setNewTitle('');
    setNewDescription('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (theme: Theme) => {
    setEditingTheme(theme);
    setNewTitle(theme.title);
    setNewDescription(theme.description);
    setOpenDialog(true);
  };

  const handleSaveTheme = async () => {
    const token = localStorage.getItem('access_token');
    const body = {
      title: newTitle,
      description: newDescription,
      class_discipline_id: classDisciplineId
    };

    console.log('editingTheme:', editingTheme);
    try {
      const res = await fetch(
        editingTheme
          ? `http://localhost:3000/themes/${editingTheme.id}`
          : 'http://localhost:3000/themes',
        {
          method: editingTheme ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );
      const { data } = await res.json();

      if (res.ok) {
        if (editingTheme) {
          setThemes((prev) =>
            prev.map((t) => (t.id === editingTheme.id ? { ...t, ...body } : t))
          );
        } else {
            
          setThemes((prev) => [...prev, {
            id: data.theme_id || data.id,
            title: data.title,
            description: data.description
          }]);
        }
        setOpenDialog(false);
        enqueueSnackbar(editingTheme ? 'Tema atualizado com sucesso!' : 'Tema criado com sucesso!', { variant: 'success' });

        setEditingTheme(null);
        setNewTitle('');
        setNewDescription('');
      } else {
        enqueueSnackbar('Erro ao salvar o tema.', { variant: 'error' });

        console.error('Erro ao salvar tema:', data);
      }
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/themes/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setThemes((prev) => prev.filter((t) => t.id !== confirmDeleteId));
        enqueueSnackbar('Tema excluído com sucesso!', { variant: 'success' });

      } else {
        enqueueSnackbar('Erro ao excluir tema.', { variant: 'error' });

        console.error('Erro ao excluir tema.');
      }
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const hasChanges = newTitle !== (editingTheme?.title || '') || newDescription !== (editingTheme?.description || '');

  return (
    <Box p={3} width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Temas para a disciplina <strong>{disciplineName}</strong> do professor <strong>{teacherName}</strong> para a turma <strong>{classCode}</strong>
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <List>
        {themes.map((t, index) => (
          <ListItem
  key={t.id}
  divider
  secondaryAction={
    <>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleOpenEditDialog(t);
        }}
      >
        <Edit />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setConfirmDeleteId(t.id);
        }}
        color="error"
      >
        <Delete />
      </IconButton>
    </>
  }
  sx={{ backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}
>
  <Box onClick={() => handleOpenEditDialog(t)} sx={{ width: '100%', cursor: 'pointer' }}>
    <ListItemText
      primary={<Typography variant="h6" fontWeight="bold">{t.title}</Typography>}
      secondary={t.description}
    />
  </Box>
</ListItem>

        ))}

        {themes.length === 0 && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Nenhum tema registrado ainda.
          </Typography>
        )}
      </List>

      {/* FABs */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => navigate(`/home/turmas/editar/${classId}`)}
          sx={{
            bgcolor: '#e0e0e0',
            '&:hover': { bgcolor: '#d5d5d5' },
            width: 56,
            height: 56,
            boxShadow: 3,
          }}
        >
          <ArrowBack />
        </IconButton>

        <IconButton
          onClick={handleOpenCreateDialog}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            width: 56,
            height: 56,
            boxShadow: 3,
          }}
        >
          <Add />
        </IconButton>
      </Box>

      {/* Dialog de novo/edição de tema */}
      <Dialog
        open={openDialog}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') setOpenDialog(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingTheme ? 'Editar Tema' : 'Novo Tema'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <Box mt={1}>
    <TextField
      label="Título"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      fullWidth
      autoFocus
      InputLabelProps={{ shrink: true }}
    />
  </Box>
  <TextField
    label="Descrição"
    value={newDescription}
    onChange={(e) => setNewDescription(e.target.value)}
    multiline
    rows={4}
    fullWidth
    InputLabelProps={{ shrink: true }}
  />
</DialogContent>

        <DialogActions>
          {hasChanges ? (
            <>
              <Button
                onClick={() => {
                  setNewTitle(editingTheme?.title || '');
                  setNewDescription(editingTheme?.description || '');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveTheme}
                variant="contained"
                disabled={!newTitle.trim() || !newDescription.trim()}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmationDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={<><Delete color="error" /> Confirmar exclusão</>}
        message={<>
          Tem certeza de que deseja excluir o tema <strong>{themes.find(t => t.id === confirmDeleteId)?.title}</strong>?
        </>}
        confirmText="Sim, excluir"
        cancelText="Voltar"
        confirmColor="error"
      />
    </Box>
  );
}