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
  useMediaQuery,
  useTheme,
  Fab,
  TextField,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import DisciplineRow from './components/listpage/DisciplineRow';

interface Discipline {
  discipline_id: string;
  name: string;
  syllabus: string;
  workload_hours: number;
}

interface ApiResponse {
  data: Discipline[];
  totalPages: number;
}

function useDynamicLimit(rowHeight = 56) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const calculateLimit = () => {
      const offset = isMobile ? 220 : 280;
      const availableHeight = window.innerHeight - offset;
      const rows = Math.floor(availableHeight / rowHeight);
      const capped = isMobile ? Math.min(rows, 6) : rows;
      setLimit(capped > 0 ? capped : 4);
    };

    calculateLimit();
    window.addEventListener('resize', calculateLimit);
    return () => window.removeEventListener('resize', calculateLimit);
  }, [rowHeight, isMobile]);

  return limit;
}

export default function DisciplinesListPage() {
  const { logout } = useAuth();
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = disciplines.find((d) => d.discipline_id === selectedId);

  const limit = useDynamicLimit();

  const openDeleteDialog = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const fetchDisciplines = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);

      const response = await fetch(`http://localhost:3000/disciplines/all?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao buscar disciplinas');

      const { data, totalPages } = (await response.json()) as ApiResponse;
      setDisciplines(data);
      setTotalPages(totalPages);
    } catch (error) {
      enqueueSnackbar('Erro ao buscar disciplinas.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchDisciplines();
  }, [currentPage, searchTerm, limit]);

  return (
    <Box
      sx={{
        px: 4,
        py: 4,
        width: '100%',
        maxWidth: `calc(100vw - ${isMobile ? 0 : sidebarWidth}px)`,
        boxSizing: 'border-box',
        minHeight: '100vh',
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
                  <TableCell sx={{ minWidth: isMobile ? 120 : 200 }}>Nome</TableCell>
                  <TableCell sx={{ minWidth: isMobile ? 80 : 140 }}>Carga Horária</TableCell>
                  <TableCell sx={{ minWidth: isMobile ? 100 : 160 }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {disciplines.map((discipline) => (
                  <DisciplineRow
                    key={discipline.discipline_id}
                    discipline={discipline}
                    onEdit={(id) => navigate(`/home/disciplinas/editar/${id}`)}
                    onDelete={openDeleteDialog}
                    isMobile={isMobile}
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
    </Box>
  );
}
