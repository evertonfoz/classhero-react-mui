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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const collapsedWidth = 64;

export default function HomePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    if (isDesktop) {
      setDesktopOpen(!desktopOpen);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: 2,
        px: 1,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} px={1}>
        <IconButton onClick={handleDrawerToggle}>
          <MenuIcon />
        </IconButton>
        {desktopOpen && (
          <Typography variant="h6" fontWeight="bold" noWrap>
            ClassHero
          </Typography>
        )}
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent={desktopOpen ? 'flex-start' : 'center'}
        px={1}
        mt="auto"
      >
        <Tooltip title="Sair">
          <IconButton onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
        {desktopOpen && (
          <Typography variant="body2" ml={1}>
            Sair
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar com botão de menu no mobile */}
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

      {/* Drawer lateral */}
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? desktopOpen : mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'block' },
          '& .MuiDrawer-paper': {
            width: isDesktop ? (desktopOpen ? drawerWidth : collapsedWidth) : drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.3s',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: !isDesktop ? 8 : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          component="img"
          src="/logos/logo_001.png"
          alt="Logo"
          sx={{
            width: { xs: '220px', md: '340px' },
            height: 'auto',
          }}
        />
      </Box>
    </Box>
  );
}