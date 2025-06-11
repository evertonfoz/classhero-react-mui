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
import { useEffect, useState } from 'react';

interface MaterialFormDialogProps {
  open: boolean;
  onClose: () => void;
  themeId: string | null;
  onSuccess: () => void;
  isEditing?: boolean;
  initialData?: {
    material_id: string;
    name: string;
    description?: string;
    type: string;
    content?: string;
    order: number;
  };
}

interface MaterialForm {
  name: string;
  description: string;
  type: string;
  url: string;
  file?: File;
  order: string;
}

export default function MaterialFormDialog({ open, onClose, themeId, onSuccess, isEditing = false, initialData }: MaterialFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const [material, setMaterial] = useState<MaterialForm>({
    name: '',
    description: '',
    type: '',
    url: '',
    file: undefined,
    order: '',
  });

  const [originalData, setOriginalData] = useState<MaterialForm | null>(null);

  const hasAnyValue = Object.values(material).some((value) => {
    if (typeof value === 'string') return value.trim() !== '';
    if (value instanceof File) return true;
    return false;
  });

  const hasChanges = isEditing
    ? originalData &&
      (material.name !== originalData.name ||
        material.description !== originalData.description ||
        material.type !== originalData.type ||
        material.url !== originalData.url ||
        material.order !== originalData.order)
    : hasAnyValue;

  const isFormValid =
    material.name.trim() !== '' &&
    material.type !== '' &&
    material.order.trim() !== '' &&
    (isEditing ? true : material.type !== 'pdf' || material.file);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterial((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    const token = localStorage.getItem('access_token');

    try {
      if (isEditing && initialData) {
        const payload = {
          title: material.name,
          description: material.description,
          type: material.type,
          content: material.type !== 'pdf' ? material.url : initialData.content,
        };

        const res = await fetch(`http://localhost:3000/theme-materials/${initialData.material_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();

        enqueueSnackbar('Material atualizado com sucesso.', { variant: 'success' });
      } else {
        if (!themeId) return;
        const formData = new FormData();
        formData.append('theme_id', themeId);
        formData.append('type', material.type);
        formData.append('title', material.name);
        formData.append('description', material.description);
        formData.append('order', material.order);
        if (material.type !== 'pdf') formData.append('content', material.url);
        if (material.file) formData.append('file', material.file);

        const res = await fetch('http://localhost:3000/theme-materials', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error();

        enqueueSnackbar('Material salvo com sucesso.', { variant: 'success' });
      }

      onSuccess();
      setMaterial({ name: '', description: '', type: '', url: '', file: undefined, order: '' });
    } catch {
      enqueueSnackbar('Erro ao salvar material.', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (!open) return;

    if (isEditing && initialData) {
      const data = {
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type,
        url: initialData.content || '',
        order: initialData.order.toString(),
      } as MaterialForm;
      setMaterial({ ...data, file: undefined });
      setOriginalData({ ...data, file: undefined });
    } else {
      const empty = { name: '', description: '', type: '', url: '', file: undefined, order: '' };
      setMaterial(empty);
      setOriginalData(empty);
    }
  }, [open, isEditing, initialData]);

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => reason !== 'backdropClick' && onClose()}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{isEditing ? 'Editar Material' : 'Novo Material'}</DialogTitle>
      <DialogContent>

        {/* ORDEM NO TOPO */}
        <TextField
          label="Ordem"
          value={material.order}
          onChange={(e) => setMaterial({ ...material, order: e.target.value })}
          fullWidth
          type="number"
          margin="normal"
        />

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
            onChange={(e) =>
              setMaterial({
                ...material,
                type: e.target.value,
                file: undefined,
                url: '',
              })
            }
          >
            <MenuItem value="text">Texto</MenuItem>
            <MenuItem value="video">Vídeo</MenuItem>
            <MenuItem value="link">Link</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="quiz">Quiz</MenuItem>
            <MenuItem value="other">Outro</MenuItem>
          </Select>
        </FormControl>

        {material.type !== 'pdf' && material.type !== '' && (
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
        {!hasChanges ? (
          <Button onClick={onClose}>Fechar</Button>
        ) : (
          <>
            <Button
              onClick={() => {
                if (isEditing && originalData) {
                  setMaterial({ ...originalData });
                } else {
                  setMaterial({
                    name: '',
                    description: '',
                    type: '',
                    url: '',
                    file: undefined,
                    order: '',
                  });
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              variant="contained"
            >
              Salvar
            </Button>
          </>
        )}
      </DialogActions>


    </Dialog>
  );
}
