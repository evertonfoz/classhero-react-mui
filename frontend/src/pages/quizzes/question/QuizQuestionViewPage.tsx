import {
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Fade,
    IconButton,
    Tooltip,
    Fab,
    Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuestionOptions from './components/QuestionOptions';
import GuidanceSection from './components/GuidanceSection';
import QuizLottieFromUrl from './components/QuizLottieFromUrl';
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

    // ---- Layout ajustado abaixo ----
    return (
        <Fade in>
            <Box
                width="100%"
                minHeight="calc(100vh - 56px)" // Ajuste se o header for diferente
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                    // Remova o gradiente externo!
                    background: '#f7f8fa', // ou nenhum fundo, ou cor bem neutra clara
                    position: 'relative',
                }}
            >
                {/* Card principal, centralizado vertical/horizontal */}
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 740,
                        minHeight: isMobile ? 'unset' : 400,
                        mx: isMobile ? 1 : 3,
                        borderRadius: 4,
                        boxShadow: 8,
                        background: 'linear-gradient(120deg,#fff,#e0f7fa 90%)', // gradiente só no Card
                        p: isMobile ? 2 : 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        {/* Header: tipo e status + ações */}
<Box
  display="flex"
  alignItems="center"
  gap={2}
  mb={2}
  sx={{
    minHeight: 72, // ou altura do seu Lottie
    width: '100%',
  }}
>
  {/* Lottie maior, alinhado à esquerda */}
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
    <QuizLottieFromUrl
      url="/lotties/true_false.json"
      style={{ width: 72, height: 72 }}
    />
  </Box>
  {/* Centraliza bloco do título+chips+ações em relação ao Lottie */}
  <Box
    display="flex"
    alignItems="center"
    width="100%"
    minHeight={72}
    sx={{
      overflow: 'hidden',
    }}
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
      {typeLabels[question.type] || question.type}
    </Typography>
    <Chip
      label={question.level}
      sx={{
        ml: 1,
        bgcolor: levelColors[question.level] || '#bdbdbd',
        color: '#fff',
        fontWeight: 'bold',
        flexShrink: 0,
      }}
    />
    <Chip
      label={question.status === "draft" ? "Rascunho" : question.status}
      color={question.status === "draft" ? "default" : "success"}
      sx={{ ml: 1, flexShrink: 0 }}
    />
    <Box flex={1} />
    {/* Ações */}
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
</Box>

                        {/* Enunciado */}
                        <Typography variant={isMobile ? "h6" : "h5"} mb={5} fontWeight="bold">
                            {question.question}
                        </Typography>

                        {/* Renderizar opções conforme o tipo */}
                        {question.type === 'multiple_choice' && (
                            <QuestionOptions options={getOptions()} correctAnswers={getCorrectAnswers()} />
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
                            <Box display="flex" gap={3} mt={2} justifyContent="center">
  <Button
    variant="contained"
    sx={{
      minWidth: 120,
      fontWeight: 'bold',
      borderRadius: 2,
      background: '#43a047', // verde
      color: '#fff',
      fontSize: 18,
      border: '2px solid #388e3c',
      boxShadow: '0 2px 10px #c8e6c9',
      textTransform: 'none',
      '&:hover': { background: '#2e7d32' },
    }}
  >
    Verdadeiro
  </Button>
  <Button
    variant="contained"
    sx={{
      minWidth: 120,
      fontWeight: 'bold',
      borderRadius: 2,
      background: '#e53935', // vermelho
      color: '#fff',
      fontSize: 18,
      border: '2px solid #b71c1c',
      boxShadow: '0 2px 10px #ffcdd2',
      textTransform: 'none',
      '&:hover': { background: '#b71c1c' },
    }}
  >
    Falso
  </Button>
</Box>
                        )}

                        {/* Outros tipos... adapte conforme necessário */}

                        <GuidanceSection
                            guidanceOnError={question.guidance_on_error}
                            guidanceOnSuccess={question.guidance_on_success}
                        />
                    </CardContent>
                </Card>

                {/* Badge gamificado ou animação (futuro: confete, mascote, etc.) */}
                <Fade in timeout={1200}>
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: isMobile ? 96 : 110,
                            left: 0,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pointerEvents: 'none',
                            opacity: 0.9,
                        }}
                    >
                        <Chip
                            icon={<QuizIcon />}
                            label={`Pergunta já foi usada ${question.times_used} vezes`}
                            color="primary"
                            sx={{ fontWeight: 'bold', fontSize: isMobile ? 13 : 15, px: 2, mb: 1 }}
                        />
                        {/* Mascote/efeito se quiser */}
                    </Box>
                </Fade>

                {/* FAB para voltar - canto inferior direito, sempre visível */}
                <Fab
                    color="primary"
                    aria-label="voltar"
                    sx={{
                        position: 'fixed',
                        bottom: isMobile ? 24 : 40,
                        right: isMobile ? 24 : 40,
                        zIndex: 1201,
                        boxShadow: 4,
                    }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowBackIcon />
                </Fab>
            </Box>
        </Fade>
    );
}
