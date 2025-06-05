import { Avatar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SidebarProfileProps {
  isSidebarOpen: boolean;
  userName: string;
  userEmail: string;
  userAvatar: string;
}

export default function SidebarProfile({
  isSidebarOpen,
  userName,
  userEmail,
  userAvatar,
}: SidebarProfileProps) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate('/home/perfil')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
        p: 1.2,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mx: 1,
        mt: 1,
        overflow: 'hidden',
        width: isSidebarOpen ? 'auto' : 48,
        height: 48,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#f0f0f0',
        },
      }}
    >
      <Avatar
        src={userAvatar || undefined}
        alt={userName || 'Avatar'}
        sx={{
          width: 36,
          height: 36,
          objectFit: 'cover',
        }}
      >
        {!userAvatar && (userName?.charAt?.(0)?.toUpperCase() ?? 'U')}
      </Avatar>

      {isSidebarOpen && (
        <Box ml={1.5} overflow="hidden">
          <Typography variant="body2" fontWeight="bold" noWrap>
            {userName || 'Meu Perfil'}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: 'block', maxWidth: 140 }}
          >
            {userEmail || 'user@exemplo.com'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}