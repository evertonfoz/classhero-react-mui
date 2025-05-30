import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Box
        component="img"
        src="/logos/logo_001.png"
        alt="Logo"
        sx={{
          width: { xs: '220px', sm: '300px', md: '420px' },
          height: 'auto',
          mb: 4,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          color: 'text.primary',
          fontWeight: 500,
          fontSize: { xs: '1rem', sm: '1.2rem' },
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.4 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.4 },
          },
        }}
      >
        Preparando sua experiência de aprendizado...
      </Typography>
    </Box>
  );
}
