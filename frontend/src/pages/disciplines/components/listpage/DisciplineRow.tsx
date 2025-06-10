import { TableRow, TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ActionCell from '../../../../components/ui/ActionCell';

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
  const navigate = useNavigate();

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => navigate(`/home/disciplinas/editar/${discipline.discipline_id}`)}
    >
      <TableCell sx={{ minWidth: isMobile ? 120 : 200 }}>
        {discipline.name}
      </TableCell>
      <TableCell sx={{ minWidth: isMobile ? 80 : 140 }}>
        {discipline.workload_hours}h
      </TableCell>
      <ActionCell
        onEdit={() => onEdit(discipline.discipline_id)}
        onDelete={() => onDelete(discipline.discipline_id)}
        sx={{ minWidth: isMobile ? 100 : 160 }}
      />
    </TableRow>
  );
}
