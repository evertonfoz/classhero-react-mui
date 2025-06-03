import {
  Avatar,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

interface Props {
  avatarUrl: string;
  previewUrl: string | null;
  selectedFile: File | null;
  isUploading: boolean;
  onOpenChoice: () => void;
  onSaveImage: () => void;
  onCancelImage: () => void;
}

export default function ProfileImageSection({
  avatarUrl,
  previewUrl,
  selectedFile,
  isUploading,
  onOpenChoice,
  onSaveImage,
  onCancelImage,
}: Props) {
  return (
    <Stack spacing={2} alignItems="center">
      <Avatar sx={{ width: 200, height: 200 }} src={previewUrl ?? avatarUrl}>
        {!previewUrl && !avatarUrl && <AccountCircleIcon sx={{ fontSize: 160 }} />}
      </Avatar>

      {!selectedFile ? (
        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          onClick={onOpenChoice}
        >
          Selecionar nova foto
        </Button>
      ) : (
        <Stack spacing={1} width="100%">
          <Button
            variant="contained"
            color="success"
            onClick={onSaveImage}
            disabled={isUploading}
            fullWidth
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Salvando...' : 'Salvar nova foto'}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancelImage}
            disabled={isUploading}
            fullWidth
          >
            Voltar foto original
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
