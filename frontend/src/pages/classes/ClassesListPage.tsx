import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Pagination,
  CircularProgress,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import ClassIcon from '@mui/icons-material/Class';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ClassRow from './components/listpage/ClassRow';
import ClassFilter from './components/listpage/ClassFilter';
import useDynamicLimit from '../../hooks/useDynamicLimit';

interface ClassItem {
  class_id: string;
  code: string;
  year: number;
  semester: number;
}

interface ApiResponse {
  data: ClassItem[];
  totalPages: number;
}

export default function ClassesListPage() {
  const { logout } = useAuth();
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [items, setItems] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const selectedItem = items.find((c) => c.class_id === selectedId);
  const limit = useDynamicLimit();

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


  const fetchClasses = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);
      const response = await fetch(`http://localhost:3000/classes/all?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erro ao buscar turmas');
      const { data, totalPages: pages } = (await response.json()) as ApiResponse;
      setItems(data);
      setTotalPages(pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentPage, searchTerm, limit]);

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

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Semestre</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <ClassRow
                    key={item.class_id}
                    item={item}
                    onEdit={(id) => navigate(`/home/turmas/editar/${id}`)}
                    onDelete={openDeleteDialog}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            sx={{ mt: 0.5, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}

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