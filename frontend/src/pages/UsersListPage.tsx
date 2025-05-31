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
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';

interface User {
  email: string | null;
  name: string | null;
  is_validated: boolean;
  is_a_admin: boolean;
  is_a_teacher: boolean;
  is_a_student: boolean;
}

interface ApiResponse {
  data: User[];
  totalUsers: number;
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
      const capped = isMobile ? Math.min(rows, 6) : rows; // evita valores altos no mobile
      setLimit(capped > 0 ? capped : 4);
    };

    calculateLimit();
    window.addEventListener('resize', calculateLimit);
    return () => window.removeEventListener('resize', calculateLimit);
  }, [rowHeight, isMobile]);

  return limit;
}


export default function UsersListPage() {
  const { logout } = useAuth();
  const { isSidebarOpen, sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = useDynamicLimit();

  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);

      const response = await fetch(`http://localhost:3000/users/all?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao buscar usuários');

      const { data, totalPages: pages } = (await response.json()) as ApiResponse;
      setUsers(data);
      setTotalPages(pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        <PeopleAltIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Usuários
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Pesquisar por email ou nome..."
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
                  <TableCell>Nome</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Validado</TableCell>
                      <TableCell align="center">Admin</TableCell>
                      <TableCell align="center">Professor</TableCell>
                      <TableCell align="center">Estudante</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Typography fontWeight="medium">{user.name ?? '(sem nome)'}</Typography>
                      {isMobile && (
                        <Typography variant="body2" color="text.secondary">
                          {user.email ?? '-'}
                        </Typography>
                      )}
                    </TableCell>

                    {!isMobile && (
                      <>
                        <TableCell>{user.email ?? '-'}</TableCell>
                        <TableCell align="center">{user.is_validated ? '✅' : '❌'}</TableCell>
                        <TableCell align="center">{user.is_a_admin ? '✅' : '❌'}</TableCell>
                        <TableCell align="center">{user.is_a_teacher ? '✅' : '❌'}</TableCell>
                        <TableCell align="center">{user.is_a_student ? '✅' : '❌'}</TableCell>
                      </>
                    )}
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
    </Box>
  );
}
