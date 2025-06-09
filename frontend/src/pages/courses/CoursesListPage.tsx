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
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import CourseRow from './components/listpage/CourseRow';
import CourseFilter from './components/listpage/CourseFilter';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';



interface Course {
  course_id: string;
  name: string;
  acronym: string;
  status: string;
}

export default function CoursesListPage() {
export default function CoursesListPage() {
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const {
    data: courses,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchData: fetchCourses,
  } = usePaginatedFetch<Course>(
    (page, limit) => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);
      if (statusFilter) query.append('status', statusFilter);
      return `http://localhost:3000/courses/all?${query.toString()}`;
    },
    [searchTerm, statusFilter],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedcourse_id, setSelectedcourse_id] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const selectedCourse = courses.find((c) => c.course_id === selectedcourse_id);

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




  return (
    <PageContainer
      sx={{
        maxWidth: `calc(100vw - ${isMobile ? 0 : sidebarWidth}px)`,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <SchoolIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Cursos
        </Typography>
      </Box>

      <CourseFilter
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setCurrentPage(1);
          setSearchTerm(value);
        }}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setCurrentPage(1);
          setStatusFilter(value);
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
                  <TableCell>Nome</TableCell>
                  <TableCell>Sigla</TableCell>
                  <TableCell align="center">Ativo</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {courses.map((course) => (
                  <CourseRow
                    key={course.course_id}
                    course={course}
                    onEdit={(id) => navigate(`/home/cursos/editar/${id}`)}
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
            Tem certeza de que deseja <strong>excluir o curso "{selectedCourse?.name}"</strong>?
          </>
        }
        confirmText={deleting ? 'Excluindo...' : 'Sim, excluir'}
        cancelText="Voltar"
        confirmColor="error"
      />

    </PageContainer>


  );
}
