import {
  TableRow, TableCell, IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface Course {
  course_id: string;
  name: string;
  acronym: string;
  status: string;
}

interface Props {
  course: Course;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CourseRow({ course, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => navigate(`/home/cursos/editar/${course.course_id}`)}
    >
      <TableCell>{course.name}</TableCell>
      <TableCell>{course.acronym.toUpperCase()}</TableCell>
      <TableCell align="center">{course.status === 'active' ? '✅' : '❌'}</TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Editar">
          <IconButton onClick={() => onEdit(course.course_id)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={() => onDelete(course.course_id)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
