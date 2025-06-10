import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit, Delete, ArrowBack, Add, ExpandMore, ExpandLess } from '@mui/icons-material';

interface Theme {
  id: string;
  title: string;
  description: string;
}

interface Material {
  id: string;
  name: string;
  type: string;
  url: string;
}

export default function ThemesPage() {
  const { classId, classDisciplineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { disciplineName, teacherName, classCode } = location.state || {};

  const [themes, setThemes] = useState<Theme[]>([]);
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Record<string, Material[]>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/themes/by-class-discipline/${classDisciplineId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await res.json();

      setThemes(
        (data || []).map((t: any) => ({
          id: t.theme_id || t.id,
          title: t.title,
          description: t.description,
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar temas:', err);
    }
  };

  const fetchMaterials = async (themeId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/materials/by-theme/${themeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await res.json();
      setMaterialsMap((prev) => ({ ...prev, [themeId]: data || [] }));
    } catch (err) {
      console.error('Erro ao buscar materiais:', err);
    }
  };

  useEffect(() => {
    if (classDisciplineId) fetchThemes();
  }, [classDisciplineId]);

  const handleExpand = (themeId: string) => {
    if (expandedThemeId === themeId) {
      setExpandedThemeId(null);
    } else {
      setExpandedThemeId(themeId);
      if (!materialsMap[themeId]) fetchMaterials(themeId);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`http://localhost:3000/themes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setThemes((prev) => prev.filter((t) => t.id !== id));
      setSnack({ open: true, message: 'Tema excluído com sucesso.', severity: 'success' });
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
      setSnack({ open: true, message: 'Erro ao excluir tema.', severity: 'error' });
    }
  };

  const handleCreateTheme = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:3000/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          class_discipline_id: classDisciplineId,
        }),
      });

      const { data } = await res.json();
      if (res.ok) {
        setThemes((prev) => [...prev, { id: data.theme_id, title: data.title, description: data.description }]);
        setOpenDialog(false);
        setNewTitle('');
        setNewDescription('');
        setSnack({ open: true, message: 'Tema criado com sucesso.', severity: 'success' });
      } else {
        setSnack({ open: true, message: 'Erro ao criar tema.', severity: 'error' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Erro ao criar tema.', severity: 'error' });
    }
  };

  return (
    <Box p={3} width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Temas para a disciplina <strong>{disciplineName}</strong> do professor <strong>{teacherName}</strong> para a turma <strong>{classCode}</strong>
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <List>
        {themes.map((t) => (
          <Box key={t.id}>
            <ListItem
              divider
              sx={{ cursor: 'pointer' }}
              onClick={() => handleExpand(t.id)}
              secondaryAction={
                <>
                  <IconButton onClick={(e) => { e.stopPropagation(); /* editar */ }}><Edit /></IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} color="error">
                    <Delete />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleExpand(t.id); }}>
                    {expandedThemeId === t.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">{t.title}</Typography>}
                secondary={t.description}
              />
            </ListItem>

            <Collapse in={expandedThemeId === t.id} timeout="auto" unmountOnExit>
              <Box px={4} py={2} bgcolor="#f9f9f9">
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Materiais:
                </Typography>
                {materialsMap[t.id]?.length ? (
                  materialsMap[t.id].map((m) => (
                    <Typography key={m.id} variant="body2" gutterBottom>
                      - [{m.type.toUpperCase()}] <a href={m.url} target="_blank" rel="noreferrer">{m.name}</a>
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum material disponível.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>

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
          onClick={() => setOpenDialog(true)}
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

      <Dialog open={openDialog} onClose={() => {}} fullWidth maxWidth="sm">
        <DialogTitle>Novo Tema</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box pt={1}>
            <TextField
              label="Título"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              autoFocus
              margin="normal"
            />
            <TextField
              label="Descrição"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {newTitle || newDescription ? (
            <>
              <Button onClick={() => { setNewTitle(''); setNewDescription(''); }}>Cancelar</Button>
              <Button onClick={handleCreateTheme} disabled={!newTitle.trim() || !newDescription.trim()} variant="contained">
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        autoHideDuration={4000}
        message={snack.message}
      />
    </Box>
  );
}
