import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

interface MaterialFormDialogProps {
  open: boolean;
  onClose: () => void;
  themeId: string | null;
  onSuccess: () => void;
}

interface MaterialForm {
  name: string;
  description: string;
  type: string;
  url: string;
  file?: File;
}

export default function MaterialFormDialog({ open, onClose, themeId, onSuccess }: MaterialFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const [material, setMaterial] = useState<MaterialForm>({
    name: '',
    description: '',
    type: '',
    url: '',
    file: undefined,
  });

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterial((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async () => {
    if (!themeId || !material.name || !material.type) return;

    const formData = new FormData();
    formData.append('theme_id', themeId);
    formData.append('type', material.type);
    formData.append('title', material.name);
    formData.append('description', material.description);
    if (material.url && material.type !== 'pdf') formData.append('content', material.url);
    if (material.file) formData.append('file', material.file);

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('http://localhost:3000/theme-materials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();

      enqueueSnackbar('Material salvo com sucesso.', { variant: 'success' });
      onSuccess();
      setMaterial({ name: '', description: '', type: '', url: '', file: undefined });
    } catch {
      enqueueSnackbar('Erro ao salvar material.', { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => reason !== 'backdropClick' && onClose()}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Novo Material</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          value={material.name}
          onChange={(e) => setMaterial({ ...material, name: e.target.value })}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Descrição"
          value={material.description}
          onChange={(e) => setMaterial({ ...material, description: e.target.value })}
          fullWidth
          multiline
          rows={2}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Tipo</InputLabel>
          <Select
            labelId="type-label"
            value={material.type}
            label="Tipo"
            onChange={(e) => setMaterial({ ...material, type: e.target.value })}
          >
            <MenuItem value="text">Texto</MenuItem>
            <MenuItem value="video">Vídeo</MenuItem>
            <MenuItem value="link">Link</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="quiz">Quiz</MenuItem>
            <MenuItem value="other">Outro</MenuItem>
          </Select>
        </FormControl>

        {material.type !== 'pdf' && (
          <TextField
            label="URL"
            value={material.url}
            onChange={(e) => setMaterial({ ...material, url: e.target.value })}
            fullWidth
            margin="normal"
          />
        )}

        {material.type === 'pdf' && (
          <>
            {material.file && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Arquivo selecionado: <strong>{material.file.name}</strong>
              </Typography>
            )}

            <Button variant="outlined" component="label" fullWidth>
              Selecionar PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileSelection}
              />
            </Button>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          onClick={handleSubmit}
          disabled={!material.name || !material.type || (material.type !== 'pdf' && !material.url)}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}