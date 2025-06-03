import { Box, Button } from '@mui/material';

interface Props {
  isEditing: boolean;
  selectedFile: File | null;
  isAdmin: boolean;
  isSelf: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  showDeleteButton: boolean;
}

export default function ProfileActionButtons({
  isEditing,
  selectedFile,
  isAdmin,
  isSelf,
  disabled, 
  onEdit,
  onDelete,
  onCancel,
  onSave,
  showDeleteButton,
}: Props) {
  return (
    <Box mt={4} display="flex" gap={2} flexWrap="wrap" justifyContent="flex-end">
      {!selectedFile && !isEditing ? (
        <>
          <Button variant="contained" onClick={onEdit} disabled={disabled}>Editar</Button>
          {!selectedFile && !isEditing && isAdmin && !isSelf && showDeleteButton && (
            <Button variant="outlined" color="error" onClick={onDelete} disabled={disabled}>
              Excluir
            </Button>
          )}
        </>
      ) : null}

      {isEditing && !selectedFile && (
        <>
          <Button variant="contained" color="success" onClick={onSave} disabled={disabled}>Salvar alterações</Button>
          <Button variant="outlined" color="inherit" onClick={onCancel}>Cancelar</Button>
        </>
      )}
    </Box>
  );
}
