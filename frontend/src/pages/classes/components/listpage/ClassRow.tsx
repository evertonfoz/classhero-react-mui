import { TableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface ClassItem {
  class_id: string;
  code: string;
  year: number;
  semester: number;
}

interface Props {
  item: ClassItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClassRow({ item, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/home/turmas/editar/${item.class_id}`)}>
      <TableCell>{item.code}</TableCell>
      <TableCell>{item.year}</TableCell>
      <TableCell>{item.semester}</TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Editar">
          <IconButton onClick={() => onEdit(item.class_id)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={() => onDelete(item.class_id)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
