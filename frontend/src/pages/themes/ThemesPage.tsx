import {
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import MaterialFormDialog from '../theme-materials/MaterialFormDialog';
import type { Material } from '../../types/material';
import ThemeFormDialog from './components/ThemeFormDialog';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ThemesList from './components/ThemesList';


interface Theme {
  id: string;
  title: string;
  description: string;
  order: number;
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
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [confirmDeleteThemeOpen, setConfirmDeleteThemeOpen] = useState(false);

  const [newOrder, setNewOrder] = useState<number | ''>('');

  const [editandoTemaId, setEditandoTemaId] = useState<string | null>(null);
  const [dialogEditTemaOpen, setDialogEditTemaOpen] = useState(false);


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
        order: t.order,
      })));
    } catch (err) {
      console.error('Erro ao carregar temas:', err);
    }
  };


  const confirmDeleteTheme = async (id: string) => {
    console.log('Confirmando exclusão do tema:', id);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`http://localhost:3000/themes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        enqueueSnackbar('Tema excluído com sucesso.', { variant: 'success' });
        setThemes((prev) => prev.filter((t) => t.id !== id));
      } else {
        const json = await res.json();
        enqueueSnackbar(json.message || 'Erro ao excluir tema.', { variant: 'error' });
      }
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
      enqueueSnackbar('Erro ao excluir tema.', { variant: 'error' });
    } finally {
      setConfirmDeleteThemeOpen(false);
      setThemeToDelete(null);
    }
  };



  const onDeleteThemeClick = (themeId: string) => {
    setThemeToDelete(themeId);
    setConfirmDeleteThemeOpen(true);
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
          material_id: m.material_id,
          theme_id: themeId,
          name: m.title,
          description: m.description,
          type: m.type,
          content: finalUrl,
          order: m.order,
          url: finalUrl,
        };
      });

      setMaterialsMap((prev) => ({ ...prev, [themeId]: mappedMaterials }));
    } catch (err) {
      console.error('Erro ao buscar materiais:', err);
    }
  };


  const handleEditTheme = (id: string) => {
    console.log('Iniciando edição do tema com id:', id);
    if (!id) {
      console.warn('ID de tema inválido para edição');
      return;
    }

    const tema = themes.find((t) => t.id === id);

    if (!tema) {
      console.warn('Tema não encontrado com id:', id);
      return;
    }

    console.log('Editando tema com id:', id);
    setEditandoTemaId(id);
    setNewTitle(tema.title);
    setNewDescription(tema.description);
    setNewOrder(tema.order);
    setOpenDialog(true);
  };





  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setOpenMaterialDialogFor(material.theme_id);
  };

  const confirmDeleteMaterial = async (materialId: string) => {
    if (!materialId) return;

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
    } finally {
      setConfirmDialogOpen(false);
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


  const handleSalvarTema = async () => {
    console.log(editandoTemaId);
    const token = localStorage.getItem('access_token');
    const url = editandoTemaId
      ? `http://localhost:3000/themes/${editandoTemaId}`
      : 'http://localhost:3000/themes';

    const payload = {
      title: newTitle,
      description: newDescription,
      order: Number(newOrder),
      ...(editandoTemaId ? {} : { class_discipline_id: classDisciplineId }),
    };

    try {
      const res = await fetch(url, {
        method: editandoTemaId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        const { data } = json;

        if (editandoTemaId) {
          // Atualiza tema existente
          setThemes((prev) =>
            prev.map((t) =>
              t.id === editandoTemaId
                ? { id: data.theme_id, title: data.title, description: data.description, order: data.order }
                : t
            )
          );
          enqueueSnackbar('Tema atualizado com sucesso.', { variant: 'success' });
        } else {
          console.log('Tema criado:', data);
          setThemes((prev) => [
            ...prev,
            {
              id: editandoTemaId ?? data.theme_id,
              title: data.title,
              description: data.description,
              order: data.order,
            },
          ]);
          enqueueSnackbar('Tema criado com sucesso.', { variant: 'success' });
        }
        await fetchThemes(); // Garante que a lista seja recarregada com IDs corretos

        // Limpa estado
        setOpenDialog(false);
        setEditandoTemaId(null);
        setNewTitle('');
        setNewDescription('');
        setNewOrder('');
      } else {
        console.log('Erro ao salvar tema:', json);
        if (json.message?.toLowerCase().includes('ordem')) {
          enqueueSnackbar(
            'Você já cadastrou um tema com essa ordem para essa disciplina. Escolha outro número.',
            { variant: 'warning' }
          );
        } else {
          enqueueSnackbar(json.message || 'Erro ao salvar tema.', { variant: 'error' });
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Erro ao salvar tema.', { variant: 'error' });
    }
  };




  const handleDeleteMaterialClick = (materialId: string) => {
    setMaterialToDelete(materialId);
    setConfirmDialogOpen(true);
  };

  return (
    <Box p={3} width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Temas para a disciplina <strong>{disciplineName}</strong> do professor <strong>{teacherName}</strong> para a turma <strong>{classCode}</strong>
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <ThemesList
        themes={themes}
        expandedThemeId={expandedThemeId}
        materialsMap={materialsMap}
        onExpand={handleExpand}
        onOpenMaterialDialog={setOpenMaterialDialogFor}
        onEditMaterial={handleEditMaterial}
        onDeleteMaterial={handleDeleteMaterialClick}
        onDeleteThemeClick={onDeleteThemeClick}
        onEditTheme={handleEditTheme}
      />


      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
        <IconButton onClick={() => navigate(`/home/turmas/editar/${classId}`)} sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d5d5d5' }, width: 56, height: 56, boxShadow: 3 }}>
          <ArrowBack />
        </IconButton>

        <IconButton
          onClick={() => {
            setEditandoTemaId(null); 
            setNewTitle('');
            setNewDescription('');
            setNewOrder('');
            setOpenDialog(true);
          }}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: 56, height: 56, boxShadow: 3 }}
        >
          <Add />
        </IconButton>

      </Box>

      <ThemeFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditandoTemaId(null);
        }}
        onSubmit={handleSalvarTema}
        isEditing={!!editandoTemaId}
        initialData={
          editandoTemaId
            ? themes.find((t) => t.id === editandoTemaId)
            : undefined
        }


        title={newTitle}
        setTitle={setNewTitle}
        description={newDescription}
        setDescription={setNewDescription}
        order={newOrder}
        setOrder={setNewOrder}
      />



      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => materialToDelete && confirmDeleteMaterial(materialToDelete)}
        title={
          <>
            <Delete color="error" />
            Confirmar exclusão
          </>
        }
        message="Deseja realmente excluir este material?"
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />


      <MaterialFormDialog
        open={!!openMaterialDialogFor}
        onClose={() => {
          setOpenMaterialDialogFor(null);
          setEditingMaterial(null);
        }}
        themeId={openMaterialDialogFor}
        onSuccess={() => {
          if (openMaterialDialogFor) fetchMaterials(openMaterialDialogFor);
          setOpenMaterialDialogFor(null);
          setEditingMaterial(null);
        }}
        isEditing={!!editingMaterial}
        initialData={editingMaterial || undefined}
      />

      <ConfirmationDialog
        open={confirmDeleteThemeOpen}
        onClose={() => setConfirmDeleteThemeOpen(false)}
        onConfirm={() => themeToDelete && confirmDeleteTheme(themeToDelete)}
        title={
          <>
            <Delete color="error" />
            Confirmar exclusão do tema
          </>
        }
        message="Tem certeza que deseja excluir este tema?"
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />

    </Box>
  );
}