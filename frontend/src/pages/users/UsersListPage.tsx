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
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useState } from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useNavigate } from 'react-router-dom';
import FilterBar from './components/FilterBar';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';

interface AvatarData {
  avatar_url: string;
  is_active: boolean;
}

interface User {
  email: string | null;
  name: string | null;
  is_validated: boolean;
  is_a_admin: boolean;
  is_a_teacher: boolean;
  is_a_student: boolean;
  users_avatars?: AvatarData[];
}


export default function UsersListPage() {
  const { sidebarWidth } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    all: true,
    notValidated: false,
    is_a_admin: false,
    is_a_teacher: false,
    is_a_student: false,
  });

  const {
    data: users,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchData: fetchUsers,
  } = usePaginatedFetch<User>(
    (page, limit) => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) query.append('search', searchTerm);
      if (!filters.all) {
        if (filters.notValidated) query.append('is_validated', 'false');
        if (filters.is_a_admin) query.append('is_a_admin', 'true');
        if (filters.is_a_teacher) query.append('is_a_teacher', 'true');
        if (filters.is_a_student) query.append('is_a_student', 'true');
      }
      return `http://localhost:3000/users/all?${query.toString()}`;
    },
    [searchTerm, filters],
  );

  const handleToggleFilter = (key: keyof typeof filters) => {
    if (key === 'all') {
      setFilters({
        all: true,
        notValidated: false,
        is_a_admin: false,
        is_a_teacher: false,
        is_a_student: false,
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        all: false,
        [key]: !prev[key],
      }));
    }
    setCurrentPage(1);
  };


  return (
    <PageContainer
      sx={{
        maxWidth: `calc(100vw - ${isMobile ? 0 : sidebarWidth}px)`,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <PeopleAltIcon />
        <Typography variant="h5" fontWeight="bold">
          Lista de Usuários
        </Typography>
      </Box>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setCurrentPage(1);
          setSearchTerm(value);
        }}
        filters={filters}
        onToggleFilter={handleToggleFilter}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 0.5 }}>
  <Table stickyHeader size="small">
    <TableHead>
      <TableRow >
        <TableCell sx={{ py: 0.5 }}>Nome</TableCell>
        {!isMobile && (
          <>
            <TableCell sx={{ py: 0.5 }}>Email</TableCell>
            <TableCell align="center" sx={{ py: 0.5 }}>Validado</TableCell>
            <TableCell align="center" sx={{ py: 0.5 }}>Admin</TableCell>
            <TableCell align="center" sx={{ py: 0.5 }}>Professor</TableCell>
            <TableCell align="center" sx={{ py: 0.5 }}>Estudante</TableCell>
          </>
        )}
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user, i) => {
        const activeAvatar = user.users_avatars?.find((a) => a.is_active);
        return (
          <TableRow
            key={i}
            hover
            sx={{ cursor: 'pointer',
    height: 48, }}
            onClick={() => navigate(`/home/perfil/${encodeURIComponent(user.email ?? '')}`)}
          >
            <TableCell sx={{ py: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  src={activeAvatar?.avatar_url}
                  alt={user.name ?? 'Avatar'}
                  sx={{ width: 32, height: 32 }}
                >
                  {!activeAvatar && user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontWeight="medium">{user.name ?? '(sem nome)'}</Typography>
              </Box>
            </TableCell>
            {!isMobile && (
              <>
                <TableCell sx={{ py: 0.5 }}>{user.email ?? '-'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>{user.is_validated ? '✅' : '❌'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>{user.is_a_admin ? '✅' : '❌'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>{user.is_a_teacher ? '✅' : '❌'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>{user.is_a_student ? '✅' : '❌'}</TableCell>
              </>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</TableContainer>


          <Box display="flex" justifyContent="center" mt={1} pb={2}>
            <Pagination
  count={totalPages}
  page={currentPage}
  onChange={(_, value) => setCurrentPage(value)}
  sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}
/>

          </Box>
        </>
      )}
    </PageContainer>
  );
}
