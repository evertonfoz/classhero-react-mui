import { Avatar, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SidebarProfileProps {
  isSidebarOpen: boolean;
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

export default function SidebarProfile({
  isSidebarOpen,
  userName,
  userEmail,
  userAvatar,
}: SidebarProfileProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      onClick={() => navigate('/home/perfil')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        px: 2,
        py: 1.2,
        borderRadius: 4,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        mx: 1.5,
        mt: 2,
        '&:hover': { backgroundColor: '#f5f7fb' },
      }}
    >
      <Avatar
        src={userAvatar || undefined}
        alt={userName || 'Avatar'}
        sx={{ width: 40, height: 40 }}
      >
        {!userAvatar && (userName?.charAt?.(0)?.toUpperCase() ?? 'U')}
      </Avatar>

      {isSidebarOpen && (
        <Box sx={{ maxWidth: isMobile ? '100px' : '150px', overflow: 'hidden' }}>
          <Typography variant="subtitle2" fontWeight={500} noWrap>
            {userName || 'Meu Perfil'}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maskImage: 'linear-gradient(to right, black 80%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent)',
              fontSize: '0.72rem',
            }}
          >
            {userEmail || 'user@exemplo.com'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
