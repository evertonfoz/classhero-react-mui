import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  CssBaseline,
  Tooltip,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';

export default function HomePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar, sidebarWidth } = useLayout();

  const handleDrawerToggle = () => {
    if (isDesktop) {
      toggleSidebar();
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleLogout = () => setDialogOpen(true);
  const confirmLogout = () => {
    setDialogOpen(false);
    logout();
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: 0,
        px: 0,
      }}
    >
      <Box>
        {/* Topo: Menu + Título sem margens */}
        <Box
          sx={{
            backgroundColor: '#e6e6e6',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            pl: 0.5,
            pr: 0,
            py: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            m: 0,
          }}
        >
          <IconButton onClick={handleDrawerToggle} size="small">
            <MenuIcon fontSize="small" />
          </IconButton>
          {isSidebarOpen && (
            <Typography variant="h6" fontWeight="bold" noWrap>
              ClassHero
            </Typography>
          )}
        </Box>

        {/* Bloco Perfil sem espaço abaixo */}
        <Box
          onClick={() => navigate('/home/perfil')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            px: 1,
            py: 1,
            borderRadius: 2,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: '#e6e6e6',
            },
          }}
        >
          <AccountCircleIcon fontSize="medium" sx={{ color: '#555' }} />
          {isSidebarOpen && (
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Meu Perfil
              </Typography>
              <Typography variant="caption" color="text.secondary">
                user@exemplo.com
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 0, borderColor: '#ccc' }} />

        {/* Itens de navegação SEM espaço entre eles */}
        <Box  display="flex" flexDirection="column" gap={0}>
          <Box
    onClick={() => navigate('/home')}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: 'pointer',
      px: 1,
      py: 0,
      borderRadius: 2,
      '&:hover': { backgroundColor: '#e0e0e0' },
    }}
  >
    <Tooltip title="Início">
      <IconButton>
        <HomeIcon />
      </IconButton>
    </Tooltip>
    {isSidebarOpen && <Typography variant="body2">Início</Typography>}
  </Box>

  {/* Item Usuários */}
  <Box
    onClick={() => navigate('/home/usuarios')}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: 'pointer',
      px: 1,
      py: 0,
      borderRadius: 2,
      '&:hover': { backgroundColor: '#e0e0e0' },
    }}
  >
    <Tooltip title="Usuários">
      <IconButton>
        <PeopleAltIcon />
      </IconButton>
    </Tooltip>
    {isSidebarOpen && <Typography variant="body2">Usuários</Typography>}
  </Box>
        </Box>
      </Box>

      {/* Botão Sair */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent={isSidebarOpen ? 'flex-start' : 'center'}
        px={1}
        mt="auto"
      >
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1,
            py: 1,
            borderRadius: 2,
            '&:hover': { backgroundColor: '#e0e0e0' },
          }}
        >
          <Tooltip title="Sair">
            <IconButton>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          {isSidebarOpen && <Typography variant="body2">Sair</Typography>}
        </Box>
      </Box>
    </Box>
  );

  const isHomeRoot = location.pathname === '/home';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {!isDesktop && (
        <AppBar position="fixed" color="inherit" elevation={0}>
          <Toolbar>
            <IconButton edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" ml={1} fontWeight="bold">
              ClassHero
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? isSidebarOpen : mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'block' },
          '& .MuiDrawer-paper': {
            width: isDesktop ? sidebarWidth : 240,
            boxSizing: 'border-box',
            transition: 'width 0.3s',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: !isDesktop ? 8 : 0,
          minHeight: '100vh',
          transition: 'margin 0.3s, width 0.3s',
          ml: {
            xs: 0,
            md: `${sidebarWidth}px`,
          },
          width: {
            xs: '100%',
            md: `calc(100% - ${sidebarWidth}px)`,
          },
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isHomeRoot ? (
          <Box
            component="img"
            src="/logos/logo_001.png"
            alt="Logo"
            sx={{
              width: { xs: '220px', md: '340px' },
              height: 'auto',
            }}
          />
        ) : (
          <Outlet />
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            backgroundColor: '#fefefe',
            boxShadow: 10,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          <LogoutIcon color="warning" />
          Confirmar saída
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ fontSize: '1rem', color: '#555' }}>
            Tem certeza de que deseja <strong>sair da sua conta</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmLogout} variant="contained" color="warning">
            Sair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
