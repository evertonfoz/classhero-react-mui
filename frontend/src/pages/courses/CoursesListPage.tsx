import {
  Box,
  Typography,
  TextField,
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
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';



interface Course {
  course_id: string;
  name: string;
  acronym: string;
  status: string;
}

interface ApiResponse {
  data: Course[];
  totalCourses: number;
  totalPages: number;
  currentPage: number;
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

export default function CoursesListPage() {
  const { logout } = useAuth();
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedcourse_id, setSelectedcourse_id] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const selectedCourse = courses.find((c) => c.course_id === selectedcourse_id);




  const limit = useDynamicLimit();

  const openDeleteDialog = (course_id: string) => {
    setSelectedcourse_id(course_id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedcourse_id) return;

    const token = localStorage.getItem('access_token');
    try {
      setDeleting(true);

      const response = await fetch(`http://localhost:3000/courses/${selectedcourse_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir curso');
      }

      enqueueSnackbar('Curso excluído com sucesso!', { variant: 'success' });
      fetchCourses();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      enqueueSnackbar('Erro ao excluir curso.', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDialogOpen(false);
      setSelectedcourse_id(null);
    }
  };



  const fetchCourses = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) query.append('search', searchTerm);
      if (statusFilter) query.append('status', statusFilter);

      const response = await fetch(`http://localhost:3000/courses/all?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao buscar cursos');

      const { data, totalPages: pages } = (await response.json()) as ApiResponse;

      setCourses(data);
      setTotalPages(pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, statusFilter, limit]);

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
        <SchoolIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Cursos
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Pesquisar por nome ou sigla..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            label="Status"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Ativo</MenuItem>
            <MenuItem value="false">Inativo</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
                  <TableCell>Nome</TableCell>
                  <TableCell>Sigla</TableCell>
                  <TableCell align="center">Ativo</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {courses.map((course, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/home/cursos/editar/${course.course_id}`)}
                  >
                    <TableCell sx={{ wordBreak: 'break-word' }}>{course.name}</TableCell>
                    <TableCell>{course.acronym.toUpperCase()}</TableCell>
                    <TableCell align="center">{course.status === 'active' ? '✅' : '❌'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/home/cursos/editar/${course.course_id}`);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Excluir">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(course.course_id);
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>


                    </TableCell>
                  </TableRow>
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
        onClick={() => navigate('/home/cursos/novo')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 10,
        }}
      >
        <AddIcon />
      </Fab>

      {/* <-- INSIRA O ITEM 5 AQUI */}
      <Dialog
        open={dialogOpen}
        onClose={() => { }}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineIcon color="error" />
          <Typography variant="h6" component="span" fontWeight="bold">
            Confirmar exclusão
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja <strong>excluir o curso "{selectedCourse?.name}"</strong>?
          </Typography>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)} disabled={deleting}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Sim, excluir'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>


  );
}
