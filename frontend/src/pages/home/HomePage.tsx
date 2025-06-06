import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  CssBaseline,
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SidebarContent from './components/SidebarContent'; // ajuste o path conforme necessário
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';



export default function HomePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isSidebarOpen, toggleSidebar, sidebarWidth } = useLayout();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  const handleClose = () => setAccountDialogOpen(false);

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

  const isHomeRoot = location.pathname === '/home';

  useEffect(() => {
    if (!user) return;

    const precisaValidar = !user.is_validated;

    if (precisaValidar) {
      setAccountDialogOpen(true);
    }
  }, [user]);

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
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={handleDrawerToggle}
          user={user}
          onLogout={handleLogout}
        />

      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: !isDesktop ? 8 : 0,
          minHeight: '100vh',
          ml: { xs: 0, md: `${sidebarWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isHomeRoot ? 'center' : 'flex-start',
          justifyContent: isHomeRoot ? 'center' : 'flex-start',
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

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmLogout}
        title={<><LogoutIcon color="warning" /> Confirmar saída</>}
        message="Tem certeza de que deseja sair da sua conta?"
        confirmText="Sair"
        cancelText="Cancelar"
        confirmColor="warning"
      />


      <Dialog
        open={accountDialogOpen}
        onClose={handleClose}
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
          <WarningAmberRoundedIcon color="warning" />
          Conta não validada
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ fontSize: '1rem', color: '#444' }}>
            Sua conta ainda <strong>não foi validada</strong> por um administrador.
            <br /><br />
            {!user?.name?.trim() || !user?.avatar?.trim() ? (
              <>Preencha seu perfil caso não tenha feito isso e aguarde a aprovação.</>
            ) : (
              <>Aguardando validação para acessar todos os recursos.</>
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleClose} autoFocus>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
