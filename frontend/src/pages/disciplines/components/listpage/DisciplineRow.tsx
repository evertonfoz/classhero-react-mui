import { TableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Discipline {
  discipline_id: string;
  name: string;
  syllabus: string;
  workload_hours: number;
}

interface Props {
  discipline: Discipline;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

export default function DisciplineRow({ discipline, onEdit, onDelete, isMobile }: Props) {
  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: isMobile ? 120 : 200 }}>
        {discipline.name}
      </TableCell>
      <TableCell sx={{ minWidth: isMobile ? 80 : 140 }}>
        {discipline.workload_hours}h
      </TableCell>
      <TableCell align="center" sx={{ minWidth: isMobile ? 100 : 160 }}>
        <Tooltip title="Editar">
          <IconButton onClick={() => onEdit(discipline.discipline_id)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={() => onDelete(discipline.discipline_id)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
