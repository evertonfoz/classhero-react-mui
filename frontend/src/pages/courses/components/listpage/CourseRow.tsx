import { TableRow, TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ActionCell from '../../../../components/ui/ActionCell';

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
      <ActionCell
        onEdit={() => onEdit(course.course_id)}
        onDelete={() => onDelete(course.course_id)}
      />
    </TableRow>
  );
}
