import { Box, Typography, Chip, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizLottieFromUrl from './QuizLottieFromUrl';

const typeLabels: Record<string, string> = {
  multiple_choice: 'Múltipla escolha',
  multiple_select: 'Múltiplas respostas',
  true_false: 'Verdadeiro ou Falso',
  fill_in_blank: 'Preenchimento',
  matching: 'Associação',
  ordering: 'Ordenação',
  short_answer: 'Resposta curta',
};

const levelColors: Record<string, string> = {
  básico: '#29B6F6',
  intermediário: '#FFB300',
  avançado: '#E53935',
};

interface QuizQuestionHeaderProps {
  type: string;
  level: string;
  status: string;
  materialId?: string;
  questionId?: string;
  lottieUrl: string;
  onEdit?: () => void;
  onValidate?: () => void;
  onDelete?: () => void;
  hideActions?: boolean;
}

export default function QuizQuestionHeader({
  type,
  level,
  status,
  lottieUrl,
  onEdit,
  onValidate,
  onDelete,
  hideActions = false,
}: QuizQuestionHeaderProps) {
    console.log('hideActions:', hideActions);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      mb={2}
      sx={{
        minHeight: 72,
        width: '100%',
      }}
    >
      {/* Lottie animado */}
      <Box
        sx={{
          width: 72,
          height: 72,
          minWidth: 72,
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mr: 1,
        }}
      >
        <QuizLottieFromUrl url={lottieUrl} style={{ width: 72, height: 72 }} />
      </Box>

      {/* Texto e chips */}
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        minHeight={72}
        sx={{ overflow: 'hidden' }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight="bold"
          color="primary"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isMobile ? 140 : 220,
            minHeight: 0,
          }}
        >
          {typeLabels[type] || type}
        </Typography>
        <Chip
          label={level}
          sx={{
            ml: 1,
            bgcolor: levelColors[level] || '#bdbdbd',
            color: '#fff',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        />
        <Chip
          label={status === "draft" ? "Rascunho" : status}
          color={status === "draft" ? "default" : "success"}
          sx={{ ml: 1, flexShrink: 0 }}
        />
        <Box flex={1} />
        {/* Ações, somente se não estiver ocultando */}
        {!hideActions && (
          <Box display="flex" gap={0.5}>
            {onEdit && (
              <Tooltip title="Editar">
                <IconButton onClick={onEdit}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {onValidate && (
              <Tooltip title="Validar questão">
                <IconButton color="success" onClick={onValidate}>
                  <VerifiedIcon />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Excluir">
                <IconButton color="error" onClick={onDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
