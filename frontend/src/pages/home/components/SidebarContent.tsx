import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import SidebarProfile from './SidebarProfile';
import SidebarItem from './SidebarItem';


interface SidebarContentProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: any;
  onLogout: () => void;
}

export default function SidebarContent({
  isSidebarOpen,
  toggleSidebar,
  user,
  onLogout,
}: SidebarContentProps) {
  const navigate = useNavigate();
  const userName = user?.name?.split?.(' ')?.[0] ?? '';
  const userEmail = user?.email ?? '';
  const userAvatar = user?.avatar ?? '';

  return (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(to bottom, #f8f9fa, #e8ebee)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #dcdcdc',
      }}
    >
      {/* TOPO */}
      <Box>
        <SidebarHeader
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <SidebarProfile
          isSidebarOpen={isSidebarOpen}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
        />

        <Divider sx={{ my: 2, opacity: 0.5 }} />

        {/* LINKS */}
        <Box display="flex" flexDirection="column" gap={0.5}>
          <SidebarItem
            icon={<HomeIcon />}
            label="Início"
            path="/home"
            visible={true}
            isSidebarOpen={isSidebarOpen}
            onClick={() => navigate('/home')}
          />

          <SidebarItem
            icon={<SchoolIcon />}
            label="Cursos"
            path="/home/cursos"
            visible={Boolean(user?.is_a_admin)}
            isSidebarOpen={isSidebarOpen}
            onClick={() => navigate('/home/cursos')}
          />

          <SidebarItem
            icon={<PeopleAltIcon />}
            label="Usuários"
            path="/home/usuarios"
            visible={Boolean(user?.is_a_admin)}
            isSidebarOpen={isSidebarOpen}
            onClick={() => navigate('/home/usuarios')}
          />


        </Box>
      </Box>

      {/* SAIR */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent={isSidebarOpen ? 'flex-start' : 'center'}
        px={1}
        mt="auto"
        mb={1.5}
      >
        <Box
          onClick={onLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#e0e0e0',
              transition: 'background-color 0.2s ease-in-out',
            },
          }}
        >
          <Tooltip title="Sair">
            <IconButton sx={{ color: '#E26A6A' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          {isSidebarOpen && <Typography variant="body2">Sair</Typography>}
        </Box>
      </Box>
    </Box>
  );
}