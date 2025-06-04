import { Box, IconButton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  visible: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  icon,
  label,
  path,
  visible,
  isSidebarOpen,
  onClick,
}: SidebarItemProps) {
  const location = useLocation();

  function isPathActive(currentPath: string, expectedPath: string): boolean {
    if (expectedPath === '/home') {
      return currentPath === '/home';
    }
    return currentPath.startsWith(expectedPath);
  }

  const isActive = isPathActive(location.pathname, path);

  if (!visible) return null;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
        gap: 1.5,
        cursor: 'pointer',
        px: isSidebarOpen ? 2 : 0,
        py: 1.2,
        borderRadius: 4,
        mx: isSidebarOpen ? 1.2 : 0,
        backgroundColor: isActive ? '#dce8ff' : '#ffffff',
        boxShadow: isActive ? 'inset 2px 0 0 #4A90E2' : '0 1px 3px rgba(0,0,0,0.07)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: '#e3eafc',
          transform: 'translateX(2px)',
        },
      }}
    >
      <IconButton
        sx={{
          color: '#4A90E2',
          backgroundColor: 'transparent',
          p: 0,
        }}
      >
        {icon}
      </IconButton>
      {isSidebarOpen && (
        <Typography
          variant="body2"
          fontWeight={isActive ? 'bold' : 'medium'}
          color={isActive ? '#1a2c4b' : '#222'}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
