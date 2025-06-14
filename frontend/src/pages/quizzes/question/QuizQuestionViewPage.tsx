// src/pages/QuizQuestionViewPage.tsx

import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
// (Você pode importar ícones/ilustrações extras conforme preferir)

interface QuizQuestion {
  question_id: string;
  material_id: string;
  type: string;
  level: string;
  question: string;
  options: string; // Assuma JSON.stringify em array, adapte se necessário
  correct_answers: string; // idem
  guidance_on_error: string;
  guidance_on_success: string;
  times_used: number;
  status: string;
  extra: string | null;
}

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

export default function QuizQuestionViewPage() {
  const { questionId, materialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Fetch question
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/quizzes/${questionId}`)
      .then(res => res.json())
      .then(data => setQuestion(data))
      .finally(() => setLoading(false));
  }, [questionId]);

  // Helper: parse options (stringified array)
  const getOptions = () => {
    try {
      return question?.options ? JSON.parse(question.options) : [];
    } catch {
      return [];
    }
  };

  const getCorrectAnswers = () => {
    try {
      return question?.correct_answers ? JSON.parse(question.correct_answers) : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <Box minHeight="70vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!question) {
    return (
      <Box minHeight="70vh" display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6">Questão não encontrada.</Typography>
      </Box>
    );
  }

  // ---- Layout abaixo ----
  return (
    <Fade in>
      <Box
        minHeight="100vh"
        bgcolor={isMobile ? '#fff' : 'linear-gradient(120deg,#ffe082 0,#80deea 100%)'}
        px={isMobile ? 1 : 3}
        py={isMobile ? 1 : 5}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        {/* Topo: voltar e ações */}
        <Box width="100%" maxWidth={600} mb={isMobile ? 1 : 3} display="flex" alignItems="center">
          <Tooltip title="Voltar">
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box flex={1} />
          <Tooltip title="Editar">
            <IconButton onClick={() => navigate(`/home/quizzes/${materialId}/editar/${question.question_id}`)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Validar questão">
            <IconButton color="success">
              <VerifiedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Card principal */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 600,
            borderRadius: 4,
            boxShadow: 8,
            background: 'linear-gradient(120deg,#fff,#e0f7fa 90%)',
            mb: isMobile ? 2 : 4,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={1} gap={1}>
              <QuizIcon fontSize="large" color="primary" />
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="primary">
                {typeLabels[question.type] || question.type}
              </Typography>
              <Chip
                label={question.level}
                sx={{
                  ml: 1,
                  bgcolor: levelColors[question.level] || '#bdbdbd',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              />
              <Chip
                label={question.status === "draft" ? "Rascunho" : question.status}
                color={question.status === "draft" ? "default" : "success"}
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant={isMobile ? "h6" : "h5"} mb={2} fontWeight="bold">
              {question.question}
            </Typography>
            {/* Imagem, animação, vídeo futuro? */}
            {/* <Box mb={2}><img src={imgUrl} alt="" style={{width:'100%', borderRadius:16}} /></Box> */}

            {/* Renderizar opções conforme o tipo */}
            {question.type === 'multiple_choice' && (
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {getOptions().map((option: string, idx: number) => (
                  <Box
                    key={option}
                    display="flex"
                    alignItems="center"
                    p={2}
                    bgcolor="#f3f3fa"
                    borderRadius={3}
                    border={getCorrectAnswers().includes(option) ? "2px solid #66bb6a" : "2px solid transparent"}
                    boxShadow={getCorrectAnswers().includes(option) ? 2 : 0}
                    gap={2}
                  >
                    <Typography variant="body1" flex={1}>
                      {option}
                    </Typography>
                    {getCorrectAnswers().includes(option) && (
                      <CheckCircleOutlineIcon color="success" />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {question.type === 'multiple_select' && (
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {getOptions().map((option: string, idx: number) => (
                  <Box
                    key={option}
                    display="flex"
                    alignItems="center"
                    p={2}
                    bgcolor="#f1f8e9"
                    borderRadius={3}
                    border={getCorrectAnswers().includes(option) ? "2px solid #43a047" : "2px solid transparent"}
                    gap={2}
                  >
                    <Typography variant="body1" flex={1}>
                      {option}
                    </Typography>
                    {getCorrectAnswers().includes(option) && (
                      <CheckCircleOutlineIcon color="success" />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {question.type === 'true_false' && (
              <Box display="flex" gap={3} mt={2}>
                {['Verdadeiro', 'Falso'].map((label, idx) => (
                  <Box
                    key={label}
                    display="flex"
                    alignItems="center"
                    p={2}
                    bgcolor="#e3f2fd"
                    borderRadius={3}
                    border={getCorrectAnswers().includes(label) ? "2px solid #0288d1" : "2px solid transparent"}
                    gap={2}
                  >
                    <Typography variant="body1">{label}</Typography>
                    {getCorrectAnswers().includes(label) && (
                      <CheckCircleOutlineIcon color="success" />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Outros tipos... adapte conforme necessário */}

            {/* Justificativas/Orientações */}
            {question.guidance_on_error && (
              <Box mt={3}>
                <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                  Orientação em caso de erro:
                </Typography>
                <Typography color="text.secondary">{question.guidance_on_error}</Typography>
              </Box>
            )}
            {question.guidance_on_success && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                  Pesquisa complementar para quem acertar:
                </Typography>
                <Typography color="text.secondary">{question.guidance_on_success}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Badge gamificado ou animação (futuro: confete, mascote, etc.) */}
        <Fade in timeout={1200}>
          <Box
            sx={{
              mt: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              opacity: 0.9,
            }}
          >
            <Chip
              icon={<QuizIcon />}
              label={`Pergunta já foi usada ${question.times_used} vezes`}
              color="primary"
              sx={{ fontWeight: 'bold', fontSize: isMobile ? 13 : 15, px: 2, mb: 1 }}
            />
            {/* Aqui pode entrar um mascote, animação de confete, SVG etc */}
          </Box>
        </Fade>
      </Box>
    </Fade>
  );
}
