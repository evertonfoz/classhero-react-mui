import {
  Box,
  Typography,
  Fab,
  useMediaQuery,
  useTheme,
  TableCell,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import ClassIcon from '@mui/icons-material/Class';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ClassRow from './components/listpage/ClassRow';
import ClassFilter from './components/listpage/ClassFilter';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';
import PaginatedTable from '../../components/ui/PaginatedTable';

interface ClassItem {
  class_id: string;
  code: string;
  year: number;
  semester: number;
}

export default function ClassesListPage() {
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: items,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchData: fetchClasses,
  } = usePaginatedFetch<ClassItem>(
    (page, limit) => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);
      return `http://localhost:3000/classes/all?${query.toString()}`;
    },
    [searchTerm],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const selectedItem = items.find((c) => c.class_id === selectedId);

  const openDeleteDialog = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/classes/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const { message } = await response.json();
        enqueueSnackbar(message || 'Erro ao excluir a turma', { variant: 'error' });
        return;
      }

      enqueueSnackbar('Turma excluída com sucesso!', { variant: 'success' });
      fetchClasses();
    } catch (err: any) {
      enqueueSnackbar('Erro ao excluir a turma.', { variant: 'error' });
      console.error(err);
    } finally {
      setDeleting(false);
      setDialogOpen(false);
      setSelectedId(null);
    }
  };



  return (
    <PageContainer sx={{ maxWidth: `calc(100vw - ${isMobile ? 0 : sidebarWidth}px)` }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ClassIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Turmas
        </Typography>
      </Box>

      <ClassFilter
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setCurrentPage(1);
          setSearchTerm(value);
        }}
      />

      <PaginatedTable
        items={items}
        loading={loading}
        columns={
          <>
            <TableCell>Código</TableCell>
            <TableCell>Ano</TableCell>
            <TableCell>Semestre</TableCell>
            <TableCell align="center">Ações</TableCell>
          </>
        }
        renderRow={(item) => (
          <ClassRow
            key={item.class_id}
            item={item}
            onEdit={(id) => navigate(`/home/turmas/editar/${id}`)}
            onDelete={openDeleteDialog}
          />
        )}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate('/home/turmas/nova')}
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 10 }}
      >
        <AddIcon />
      </Fab>

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={<><DeleteOutlineIcon color="error" /> Confirmar exclusão</>}
        message={
          <>
            Tem certeza de que deseja <strong>excluir a turma "{selectedItem?.code}"</strong>?<br />
            <small>Todos os vínculos com disciplinas e estudantes serão removidos.</small>
          </>
        }
        confirmText={deleting ? 'Excluindo...' : 'Sim, excluir'}
        cancelText="Voltar"
        confirmColor="error"
      />

    </PageContainer>
  );
}