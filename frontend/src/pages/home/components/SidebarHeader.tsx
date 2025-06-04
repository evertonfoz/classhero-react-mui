import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function SidebarHeader({ isSidebarOpen, toggleSidebar }: SidebarHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pl: 2,
        py: 1.2,
        mx: 1.5,
        mt: 2, // <-- Adicionado aqui o espaço no topo
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <IconButton onClick={toggleSidebar} size="small" sx={{ color: '#4A90E2' }}>
        <MenuIcon fontSize="small" />
      </IconButton>

      {isSidebarOpen && !isMobile && (
        <Typography
          variant="subtitle1"
          fontWeight={600}
          letterSpacing={0.5}
          sx={{ color: '#2c3e50' }}
        >
          ClassHero
        </Typography>
      )}
    </Box>
  );
}
