import { TableCell, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

interface ActionCellProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: ReactNode;
  deleteLabel?: ReactNode;
  sx?: SxProps<Theme>;
}

export default function ActionCell({
  onEdit,
  onDelete,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
  sx,
}: ActionCellProps) {
  return (
    <TableCell align="center" onClick={(e) => e.stopPropagation()} sx={sx}>
      <Tooltip title={editLabel}>
        <IconButton onClick={onEdit} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteLabel}>
        <IconButton onClick={onDelete} size="small">
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Tooltip>
    </TableCell>
  );
}
