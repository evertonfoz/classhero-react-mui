import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit, Delete, ArrowBack, Add } from '@mui/icons-material';

interface Theme {
  id: string;
  title: string;
  description: string;
}

export default function ThemesPage() {
  const { classId, classDisciplineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { disciplineName, teacherName, classCode } = location.state || {};

  const [themes, setThemes] = useState<Theme[]>([]);

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

  const handleEdit = (theme: Theme) => {
    console.log('Editar:', theme);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`http://localhost:3000/themes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setThemes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
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
          <ListItem
            key={t.id}
            divider
            secondaryAction={
              <>
                <IconButton onClick={() => handleEdit(t)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(t.id)} color="error">
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={
                <Typography variant="h6" fontWeight="bold">
                  {t.title}
                </Typography>
              }
              secondary={t.description}
            />
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
          onClick={() => console.log('Adicionar Tema')}
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
    </Box>
  );
}
