import {
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowBack, Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import MaterialFormDialog from './components/MaterialFormDialog';
import ThemeItem from './components/ThemeItem';
import type { Material } from '../../types/material';


interface Theme {
  id: string;
  title: string;
  description: string;
}

export default function ThemesPage() {
  const { classId, classDisciplineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { disciplineName, teacherName, classCode } = location.state || {};

  const [themes, setThemes] = useState<Theme[]>([]);
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Record<string, Material[]>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [openMaterialDialogFor, setOpenMaterialDialogFor] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState<Partial<Material> & { file?: File }>({});

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/themes/by-class-discipline/${classDisciplineId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await res.json();

      setThemes((data || []).map((t: any) => ({
        id: t.theme_id || t.id,
        title: t.title,
        description: t.description,
      })));
    } catch (err) {
      console.error('Erro ao carregar temas:', err);
    }
  };

  const fetchMaterials = async (themeId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/theme-materials/by-theme/${themeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const mappedMaterials = (data || []).map((m: any) => {
        let finalUrl = m.content;
        try {
          const parsed = JSON.parse(m.content);
          if (parsed?.publicUrl) {
            finalUrl = parsed.publicUrl;
          }
        } catch (err) {
          // content já é URL simples
        }

        return {
          id: m.material_id,
          name: m.title,
          description: m.description,
          type: m.type,
          content: finalUrl,
        };
      });

      setMaterialsMap((prev) => ({ ...prev, [themeId]: mappedMaterials }));
    } catch (err) {
      console.error('Erro ao buscar materiais:', err);
    }
  };


  const handleEditMaterial = (material: Material) => {
    setOpenMaterialDialogFor(material.material_id); // ou tema atual
    setNewMaterial(material); // pré-carrega os campos no dialog
  };

  const handleDeleteMaterial = async (materialId: string) => {
    const confirm = window.confirm('Deseja realmente excluir este material?');
    if (!confirm) return;

    const token = localStorage.getItem('access_token');
    try {
      await fetch(`http://localhost:3000/theme-materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      enqueueSnackbar('Material excluído com sucesso.', { variant: 'success' });

      if (expandedThemeId) fetchMaterials(expandedThemeId);
    } catch (err) {
      console.error('Erro ao excluir material:', err);
      enqueueSnackbar('Erro ao excluir material.', { variant: 'error' });
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
      enqueueSnackbar('Tema excluído com sucesso.', { variant: 'success' });
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
      enqueueSnackbar('Erro ao excluir tema.', { variant: 'error' });
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
        enqueueSnackbar('Tema criado com sucesso.', { variant: 'success' });
      } else {
        enqueueSnackbar('Erro ao criar tema.', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Erro ao criar tema.', { variant: 'error' });
    }
  };

  const handleCreateMaterial = async () => {
    if (!openMaterialDialogFor || !newMaterial.name || !newMaterial.type) return;

    const formData = new FormData();
    formData.append('theme_id', openMaterialDialogFor);
    formData.append('type', newMaterial.type);
    formData.append('title', newMaterial.name);
    if (newMaterial.description) formData.append('description', newMaterial.description);
    if (newMaterial.url && newMaterial.type !== 'pdf') formData.append('content', newMaterial.url);
    if (newMaterial.file) formData.append('file', newMaterial.file);

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:3000/theme-materials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      await res.json();
      if (res.ok) {
        enqueueSnackbar('Material salvo com sucesso.', { variant: 'success' });
        fetchMaterials(openMaterialDialogFor);
        setOpenMaterialDialogFor(null);
        setTimeout(() => setNewMaterial({}), 100);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error('Erro ao salvar material:', err);
      enqueueSnackbar('Erro ao salvar material.', { variant: 'error' });
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
        {themes.map((t, index) => (
          <ThemeItem
            key={t.id}
            themeId={t.id}
            title={t.title}
            description={t.description}
            expanded={expandedThemeId === t.id}
            materials={materialsMap[t.id] || []}
            onExpand={handleExpand}
            onDelete={handleDelete}
            onOpenMaterialDialog={setOpenMaterialDialogFor}
            zebraIndex={index}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}


          />
        ))}
      </List>

      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
        <IconButton onClick={() => navigate(`/home/turmas/editar/${classId}`)} sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d5d5d5' }, width: 56, height: 56, boxShadow: 3 }}>
          <ArrowBack />
        </IconButton>

        <IconButton onClick={() => setOpenDialog(true)} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: 56, height: 56, boxShadow: 3 }}>
          <Add />
        </IconButton>
      </Box>

      <Dialog open={openDialog} onClose={() => { }} fullWidth maxWidth="sm">
        <DialogTitle>Novo Tema</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box pt={1}>
            <TextField label="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} fullWidth autoFocus margin="normal" />
            <TextField label="Descrição" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} multiline rows={4} fullWidth margin="normal" />
          </Box>
        </DialogContent>
        <DialogActions>
          {newTitle || newDescription ? (
            <>
              <Button onClick={() => { setNewTitle(''); setNewDescription(''); }}>Cancelar</Button>
              <Button onClick={handleCreateTheme} disabled={!newTitle.trim() || !newDescription.trim()} variant="contained">Salvar</Button>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          )}
        </DialogActions>
      </Dialog>

      <MaterialFormDialog
        open={!!openMaterialDialogFor}
        onClose={() => setOpenMaterialDialogFor(null)}
        themeId={openMaterialDialogFor}
        onSuccess={() => {
          if (openMaterialDialogFor) fetchMaterials(openMaterialDialogFor);
          setOpenMaterialDialogFor(null);
        }}
      />
    </Box>
  );
}