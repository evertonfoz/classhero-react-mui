import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'info' | 'warning' | 'error' });
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [loadingValidate, setLoadingValidate] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
        setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    };

    const showMessage = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleRequestCode = async () => {
        setLoadingRequest(true);
        try {
            const response = await fetch('http://localhost:3000/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Código enviado para seu e-mail!', 'success');
                setStep('code');
            } else {
                showMessage(`Erro: ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar o código:', error);
            showMessage('Não foi possível enviar o código. Tente novamente.', 'error');
        } finally {
            setLoadingRequest(false);
        }
    };

    const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = event.target.value.replace(/\D/g, '');
        setCode(numericValue);
    };

    const handleReset = () => {
        setEmail('');
        setIsValidEmail(false);
        setCode('');
        setStep('email');
        setErrorMessage('');
    };

    const handleValidateCode = async () => {
        setLoadingValidate(true);
        try {
            const response = await fetch('http://localhost:3000/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.access_token);
            } else {
                setErrorMessage(data.message || 'Código inválido. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao verificar o código:', error);
            setErrorMessage('Erro de conexão. Tente novamente.');
        } finally {
            setLoadingValidate(false);
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
                        sx={{ width: { xs: '180px', sm: '220px', md: '260px' }, height: 'auto' }}
                    />
                </Box>

                <Box
                    sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
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
                                disabled={!isValidEmail || loadingRequest}
                                onClick={handleRequestCode}
                            >
                                {loadingRequest ? 'Enviando...' : 'Solicitar código'}
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
                                        disabled={code.length !== 6 || loadingValidate}
                                    >
                                        {loadingValidate ? 'Validando...' : 'Validar'}
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
