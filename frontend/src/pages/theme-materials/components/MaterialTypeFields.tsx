import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
} from '@mui/material';

interface Props {
  type: string;
  url: string;
  file?: File;
  disabled: boolean;
  isEditing: boolean;
  removeExistingFile: boolean;
  onTypeChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onFileSelect: (file?: File) => void;
}

export default function MaterialTypeFields({
  type,
  url,
  file,
  disabled,
  isEditing,
  removeExistingFile,
  onTypeChange,
  onUrlChange,
  onFileSelect,
}: Props) {
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileSelect(file);
  };

  return (
    <>
      <FormControl fullWidth margin="normal">
        <InputLabel id="type-label">Tipo</InputLabel>
        <Select
          labelId="type-label"
          value={type}
          label="Tipo"
          disabled={disabled}
          onChange={(e) => {
            onTypeChange(e.target.value);
            onFileSelect(undefined); // limpar PDF se mudar tipo
          }}
        >
          <MenuItem value="text">Texto</MenuItem>
          <MenuItem value="video">Vídeo</MenuItem>
          <MenuItem value="link">Link</MenuItem>
          <MenuItem value="pdf">PDF</MenuItem>
          <MenuItem value="quiz">Quiz</MenuItem>
          <MenuItem value="podcast">Podcast</MenuItem>
          <MenuItem value="other">Outro</MenuItem>
        </Select>
      </FormControl>

      

      {type === 'pdf' && (
        <>
          {(file || url) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              Arquivo atual:{' '}
              <strong>
                {file?.name || url?.split('/').pop()}
              </strong>
            </Typography>
          )}

          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={disabled}
          >
            {(file || url) ? 'Trocar PDF' : 'Selecionar PDF'}
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileSelection}
            />
          </Button>
        </>
      )}
    </>
  );
}
