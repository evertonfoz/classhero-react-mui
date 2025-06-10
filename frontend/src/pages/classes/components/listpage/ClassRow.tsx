import { TableRow, TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ActionCell from '../../../../components/ui/ActionCell';

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
      <ActionCell
        onEdit={() => onEdit(item.class_id)}
        onDelete={() => onDelete(item.class_id)}
      />
    </TableRow>
  );
}
