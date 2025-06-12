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
  CircularProgress,
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
  youtube_pt_url?: string;
  youtube_en_url?: string; 
}

function extractFileName(content?: string) {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    if (parsed.fileName) return parsed.fileName;
    if (parsed.publicUrl) {
      return decodeURIComponent(parsed.publicUrl.split('/').pop() || '');
    }
  } catch {
    try {
      const clean = content.split('?')[0];
      return decodeURIComponent(clean.split('/').pop() || '');
    } catch {
      return '';
    }
  }
  return '';
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
    youtube_pt_url: '',
    youtube_en_url: '',
  });

  const [loadingLinks, setLoadingLinks] = useState(false);
  const [saving, setSaving] = useState(false);
const isBusy = saving || loadingLinks;



  const [originalData, setOriginalData] = useState<MaterialForm | null>(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<{ pt: string; en: string }>({ pt: '', en: '' });

  const hasAnyValue = Object.values(material).some((value) => {
    if (typeof value === 'string') return value.trim() !== '';
    if (value instanceof File) return true;
    return false;
  });

  const hasChanges = isEditing
    ?
    originalData &&
    (material.name !== originalData.name ||
      material.description !== originalData.description ||
      material.type !== originalData.type ||
      material.url !== originalData.url ||
      material.order !== originalData.order ||
      material.youtube_pt_url !== originalData.youtube_pt_url ||
      material.youtube_en_url !== originalData.youtube_en_url ||
      !!material.file ||
      removeExistingFile)
    : hasAnyValue;

  const isFormValid =
    material.name.trim() !== '' &&
    material.description.trim() !== '' &&
    material.type !== '' &&
    material.order.trim() !== '' &&
    (material.type !== 'pdf'
      ? true
      : isEditing
        ? !removeExistingFile || !!material.file 
        : !!material.file);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterial((prev) => ({ ...prev, file }));
      setRemoveExistingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setMaterial((prev) => ({ ...prev, file: undefined }));
    setRemoveExistingFile(true);
  };

  const handleSubmit = async () => {
  if (!isFormValid) return;

  setSaving(true);
  const token = localStorage.getItem('access_token');

  try {
    if (isEditing && initialData) {
      if (material.file) {
        const formData = new FormData();
        formData.append('title', material.name);
        formData.append('description', material.description);
        formData.append('type', material.type);
        formData.append('order', material.order);
        formData.append('file', material.file);

        const res = await fetch(`http://localhost:3000/theme-materials/${initialData.material_id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error();
        enqueueSnackbar('Material atualizado com sucesso.', { variant: 'success' });
      } else {
        const payload: Record<string, any> = {
          title: material.name,
          description: material.description,
          type: material.type,
          content: material.type !== 'pdf' ? material.url : initialData.content,
          order: material.order,
        };

        if (material.type !== 'pdf') {
          payload.youtube_pt_url = material.youtube_pt_url || '';
          payload.youtube_en_url = material.youtube_en_url || '';
        }

        const res = await fetch(`http://localhost:3000/theme-materials/${initialData.material_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
        enqueueSnackbar('Material atualizado com sucesso.', { variant: 'success' });
      }
    } else {
      if (!themeId) return;

      const formData = new FormData();
      formData.append('theme_id', themeId);
      formData.append('type', material.type);
      formData.append('title', material.name);
      formData.append('description', material.description);
      formData.append('order', material.order);

      if (material.type !== 'pdf') {
        formData.append('content', material.url);
        formData.append('youtube_pt_url', material.youtube_pt_url || '');
        formData.append('youtube_en_url', material.youtube_en_url || '');
      }

      if (material.file) {
        formData.append('file', material.file);
      }

      const res = await fetch('http://localhost:3000/theme-materials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();

      enqueueSnackbar('Material salvo com sucesso.', { variant: 'success' });
    }

    onSuccess();
    setMaterial({
      name: '',
      description: '',
      type: '',
      url: '',
      file: undefined,
      order: '',
      youtube_pt_url: '',
      youtube_en_url: '',
    });
    setExistingFileName('');
    setRemoveExistingFile(false);
  } catch {
    enqueueSnackbar('Erro ao salvar material.', { variant: 'error' });
  } finally {
    setSaving(false);
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
  youtube_pt_url: (initialData as any).youtube_pt_url || '',
  youtube_en_url: (initialData as any).youtube_en_url || '',
} as MaterialForm;

      setMaterial({ ...data, file: undefined });
      setOriginalData({ ...data, file: undefined });
      setExistingFileName(extractFileName(initialData.content));
      setRemoveExistingFile(false);
    } else {
      const empty = { name: '', description: '', type: '', url: '', file: undefined, order: '' };
      setMaterial(empty);
      setOriginalData(empty);
      setExistingFileName('');
      setRemoveExistingFile(false);
    }
  }, [open, isEditing, initialData]);


  async function gerarLinksYouTube() {
  setLoadingLinks(true);

  try {
    const res = await fetch('http://localhost:8000/youtube-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: material.name,
        description: material.description,
      }),
    });

    if (!res.ok) throw new Error('Erro ao gerar links');

    const data = await res.json();

    setMaterial((prev) => ({
      ...prev,
      youtube_pt_url: data.pt,
      youtube_en_url: data.en,
    }));

    enqueueSnackbar('Links do YouTube gerados com sucesso!', { variant: 'success' });
  } catch (err) {
    enqueueSnackbar('Erro ao gerar links do YouTube', { variant: 'error' });
  } finally {
    setLoadingLinks(false);
  }
}



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
          disabled={isBusy}
        />

        <TextField
          label="Nome"
          value={material.name}
          onChange={(e) => setMaterial({ ...material, name: e.target.value })}
          fullWidth
          margin="normal"
          disabled={isBusy}
        />

        <TextField
          label="Descrição"
          value={material.description}
          onChange={(e) => setMaterial({ ...material, description: e.target.value })}
          fullWidth
          multiline
          rows={2}
          margin="normal"
          disabled={isBusy}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Tipo</InputLabel>
          <Select
            labelId="type-label"
            value={material.type}
            label="Tipo"
            disabled={isBusy}
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
          disabled={isBusy}
            label="URL"
            value={material.url}
            onChange={(e) => setMaterial({ ...material, url: e.target.value })}
            fullWidth
            margin="normal"
          />
        )}

        {material.type === 'pdf' && (
          <>
            {/* Mostra o nome do arquivo selecionado OU nome do anterior se estiver em edição */}
            {(material.file || material.url) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Arquivo atual:{' '}
                <strong>
                  {material.file?.name || material.url?.split('/').pop()}
                </strong>
              </Typography>
            )}

            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={saving || loadingLinks}
            >
              {(material.file || material.url) ? 'Trocar PDF' : 'Selecionar PDF'}
              <input
              disabled={isBusy}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileSelection}
              />
            </Button>

          </>
        )}

        {/* Botão para gerar os links */}
        {isFormValid && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={gerarLinksYouTube}
            disabled={loadingLinks}
            startIcon={loadingLinks && <CircularProgress size="1rem" />}
          >
            {loadingLinks ? 'Gerando links...' : 'Gerar Links do YouTube'}
          </Button>
        )}


        {/* Campos de links gerados */}
        {isFormValid && material.youtube_pt_url && (
  <TextField
    label="YouTube (Português)"
    value={material.youtube_pt_url}
    InputProps={{ readOnly: true }}
    fullWidth
    margin="normal"
    disabled={isBusy}
  />
)}
{isFormValid && material.youtube_en_url && (
  <TextField
    label="YouTube (Inglês)"
    value={material.youtube_en_url}
    InputProps={{ readOnly: true }}
    fullWidth
    margin="normal"
    disabled={isBusy}
  />
)}


      </DialogContent>

      <DialogActions>
        {!hasChanges ? (
          <Button onClick={onClose} disabled={loadingLinks || saving}>Fechar</Button>
        ) : (
          <>
            <Button
              onClick={() => {
                if (isEditing && originalData) {
                  setMaterial({ ...originalData });
                  setExistingFileName(extractFileName(initialData?.content));
                  setRemoveExistingFile(false);
                } else {
                  setMaterial({
                    name: '',
                    description: '',
                    type: '',
                    url: '',
                    file: undefined,
                    order: '',
                  });
                  setExistingFileName('');
                  setRemoveExistingFile(false);
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || saving}
              variant="contained"
              startIcon={saving && <CircularProgress size="1rem" />}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>


          </>
        )}
      </DialogActions>


    </Dialog>
  );
}
