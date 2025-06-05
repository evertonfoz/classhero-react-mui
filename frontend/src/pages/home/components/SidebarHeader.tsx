/** SidebarHeader.tsx */
import { Box, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function SidebarHeader({
  isSidebarOpen,
  toggleSidebar,
}: SidebarHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dcdcdc',
        px: 1,
        py: 1,
        height: 48,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 2,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
        onClick={toggleSidebar}
      >
        <MenuIcon sx={{ fontSize: 22, color: '#4A90E2' }} />
      </Box>

      {isSidebarOpen && (
        <Typography
          variant="h6"
          fontWeight="bold"
          noWrap
          sx={{ ml: 1.5 }}
        >
          ClassHero
        </Typography>
      )}
    </Box>
  );
}
