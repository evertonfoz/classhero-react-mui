import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // já deve estar no topo

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');


  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

  const handleRequestCode = () => {
    setStep('code');
  };

  const handleReset = () => {
    setEmail('');
    setIsValidEmail(false);
    setCode('');
    setStep('email');
  };

    const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, ''); // remove tudo que não for número
    setCode(numericValue);
    };

  const handleValidateCode = () => {
  if (code === '123456') {
    navigate('/home');
  } else {
    setErrorMessage('Código inválido. Tente novamente.');
  }
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '960px',
          backgroundColor: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* Coluna da logo */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
            borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            component="img"
            src="/logos/logo_001.png"
            alt="Logo"
            sx={{
              width: { xs: '180px', sm: '220px', md: '260px' },
              height: 'auto',
            }}
          />
        </Box>

        {/* Coluna do formulário */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box width="100%" maxWidth="400px" mx="auto">
            <Typography variant="h5" gutterBottom>
              Acesse sua conta
            </Typography>

            <TextField
              fullWidth
              type="email"
              label="E-mail"
              margin="normal"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
              disabled={step === 'code'}
            />

            {step === 'email' && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
                disabled={!isValidEmail}
                onClick={handleRequestCode}
              >
                Solicitar código
              </Button>
            )}

            {step === 'code' && (
              <>
                <TextField
                  fullWidth
                  type="text"
                  label="Código de acesso"
                  margin="normal"
                  variant="outlined"
                  value={code}
                  onChange={handleCodeChange}
                />
                {errorMessage && (
  <Typography color="error" variant="body2" mt={1}>
    {errorMessage}
  </Typography>
)}


                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleValidateCode}
                    disabled={code.length !== 6}
                    >
                    Validar
                    </Button>


                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleReset}
                  >
                    Trocar e-mail
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
