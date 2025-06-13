
import { TableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


interface QuizQuestion {
  question_id: string;
  material_id: string;
  type: string;
  level: string;
  question: string;
  options: string;
  correct_answers: string;
  guidance_on_error: string;
  guidance_on_success: string;
  times_used: number;
  status: string;
  extra?: string | null;
}

interface QuizQuestionRowProps {
  question: QuizQuestion;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}
export default function QuizQuestionRow({
  question,
  onEdit,
  onDelete,
  isMobile,
}: QuizQuestionRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 'bold', maxWidth: 360, whiteSpace: 'pre-line' }}>
        {question.question}
      </TableCell>
      <TableCell>{question.level}</TableCell>
      <TableCell>{question.status}</TableCell>
      <TableCell align="center">
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(question.question_id)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" color="error" onClick={() => onDelete(question.question_id)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
