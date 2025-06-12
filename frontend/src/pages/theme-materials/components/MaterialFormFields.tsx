// components/MaterialFormFields.tsx
import {
  TextField,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import YoutubeLinkField from './YoutubeLinkField';
import MaterialTypeFields from './MaterialTypeFields';

interface Props {
  material: {
    name: string;
    description: string;
    type: string;
    url: string;
    file?: File;
    order: string;
    youtube_pt_url?: string;
    youtube_en_url?: string;
  };
  isBusy: boolean;
  isEditing: boolean;
  isFormValid: boolean;
  loadingLinks: boolean;
  onMaterialChange: (newMaterial: Partial<Props['material']>) => void;
  onGenerateLinks: () => void;
  removeExistingFile: boolean;
}

export default function MaterialFormFields({
  material,
  isBusy,
  isEditing,
  isFormValid,
  loadingLinks,
  onMaterialChange,
  onGenerateLinks,
  removeExistingFile,
}: Props) {
  return (
    <>
      <TextField
        label="Ordem"
        value={material.order}
        onChange={(e) => onMaterialChange({ order: e.target.value })}
        fullWidth
        type="number"
        margin="normal"
        disabled={isBusy}
      />

      <TextField
        label="Nome"
        value={material.name}
        onChange={(e) => onMaterialChange({ name: e.target.value })}
        fullWidth
        margin="normal"
        disabled={isBusy}
      />

      <TextField
        label="Descrição"
        value={material.description}
        onChange={(e) => onMaterialChange({ description: e.target.value })}
        fullWidth
        multiline
        rows={2}
        margin="normal"
        disabled={isBusy}
      />

      <MaterialTypeFields
        type={material.type}
        url={material.url}
        file={material.file}
        isEditing={isEditing}
        disabled={isBusy}
        removeExistingFile={removeExistingFile}
        onTypeChange={(value) =>
          onMaterialChange({ type: value, file: undefined, url: '' })
        }
        onUrlChange={(value) =>
          onMaterialChange({ url: value })
        }
        onFileSelect={(file) => {
          onMaterialChange({ file });
        }}
      />

      {material.type !== 'pdf' && material.type !== '' && (
        <Box mt={2}>
          <YoutubeLinkField
            label="URL"
            value={material.url}
            onChange={(v) => onMaterialChange({ url: v })}
            disabled={isBusy}
          />
        </Box>
      )}

      {material.type === 'pdf' && isFormValid && (
        <>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={onGenerateLinks}
            disabled={loadingLinks}
            startIcon={loadingLinks && <CircularProgress size="1rem" />}
          >
            {loadingLinks ? 'Gerando links...' : 'Gerar Links do YouTube'}
          </Button>

          <Box mt={2}>
            <YoutubeLinkField
              label="YouTube (Português)"
              value={material.youtube_pt_url ?? ''}
              onChange={(v) => onMaterialChange({ youtube_pt_url: v })}
              disabled={isBusy}
            />
          </Box>

          <Box mt={2}>
            <YoutubeLinkField
              label="YouTube (Inglês)"
              value={material.youtube_en_url ?? ''}
              onChange={(v) => onMaterialChange({ youtube_en_url: v })}
              disabled={isBusy}
            />
          </Box>
        </>
      )}
    </>
  );
}
