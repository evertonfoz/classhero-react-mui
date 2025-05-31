import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: 'João da Silva',
    email: 'joao@exemplo.com',
    avatar: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    console.log('Dados salvos:', userData);
    alert('Dados salvos com sucesso!');
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        height: '100%',
        pt: 0.5,
        px: 0,
        display: 'block',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 800,
          ml: 0,
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 4,
          }}
        >
          {/* Foto e botão */}
          <Stack spacing={2} alignItems="center">
            <Avatar
              sx={{ width: 200, height: 200 }}
              src={previewUrl ?? ''}
            >
              {!previewUrl && <AccountCircleIcon sx={{ fontSize: 160 }} />}
            </Avatar>

            <Button variant="outlined" component="label">
              Enviar nova foto
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          </Stack>

          {/* Campos de entrada centralizados verticalmente */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
            />
          </Box>
        </Box>

        {/* Botão salvar abaixo */}
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
          >
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
