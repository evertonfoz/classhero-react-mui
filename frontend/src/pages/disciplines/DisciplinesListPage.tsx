import {
  Box,
  Typography,
  Fab,
  TextField,
  useMediaQuery,
  useTheme,
  TableCell,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import DisciplineRow from './components/listpage/DisciplineRow';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';
import PaginatedTable from '../../components/ui/PaginatedTable';

interface Discipline {
  discipline_id: string;
  name: string;
  syllabus: string;
  workload_hours: number;
}


export default function DisciplinesListPage() {
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: disciplines,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchData: fetchDisciplines,
  } = usePaginatedFetch<Discipline>(
    (page, limit) => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);
      return `http://localhost:3000/disciplines/all?${query.toString()}`;
    },
    [searchTerm],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = disciplines.find((d) => d.discipline_id === selectedId);

  const openDeleteDialog = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };


  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    const token = localStorage.getItem('access_token');
    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:3000/disciplines/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();

      enqueueSnackbar('Disciplina excluída com sucesso!', { variant: 'success' });
      fetchDisciplines();
    } catch (error) {
      enqueueSnackbar('Erro ao excluir disciplina.', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDialogOpen(false);
      setSelectedId(null);
    }
  };


  return (
    <PageContainer
      sx={{
        maxWidth: `calc(100vw - ${isMobile ? 0 : sidebarWidth}px)`,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <MenuBookIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Disciplinas
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Pesquisar por nome..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => {
          setCurrentPage(1);
          setSearchTerm(e.target.value);
        }}
        sx={{ mb: 3 }}
      />

      <PaginatedTable
        items={disciplines}
        loading={loading}
        columns={
          <>
            <TableCell sx={{ minWidth: isMobile ? 120 : 200 }}>Nome</TableCell>
            <TableCell sx={{ minWidth: isMobile ? 80 : 140 }}>Carga Horária</TableCell>
            <TableCell sx={{ minWidth: isMobile ? 100 : 160 }} align="center">Ações</TableCell>
          </>
        }
        renderRow={(discipline) => (
          <DisciplineRow
            key={discipline.discipline_id}
            discipline={discipline}
            onEdit={(id) => navigate(`/home/disciplinas/editar/${id}`)}
            onDelete={openDeleteDialog}
            isMobile={isMobile}
          />
        )}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        minWidth={isMobile ? 280 : 500}
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate('/home/disciplinas/nova')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 10,
        }}
      >
        <AddIcon />
      </Fab>

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          <>
            <DeleteOutlineIcon color="error" />
            Confirmar exclusão
          </>
        }
        message={
          <>
            Tem certeza de que deseja excluir a disciplina <strong>"{selected?.name}"</strong>?
          </>
        }
        confirmText={deleting ? 'Excluindo...' : 'Sim, excluir'}
        cancelText="Voltar"
        confirmColor="error"
      />
    </PageContainer>
  );
}
