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
    Fab,
    Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuestionOptions from './components/QuestionOptions';
import GuidanceSection from './components/GuidanceSection';
import QuizQuestionHeader from './components/QuizQuestionHeader';
import SimulationFab from './components/SimulationFab';
import CelebrationLottie from './components/CelebrationLottie';
import { motion } from "framer-motion";
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

    const mensagensErro = [
        "Faz parte do processo! Na próxima questão, você vai arrasar!",
        "Errar é sinal de quem está tentando — parabéns pela coragem!",
        "O importante é aprender! Bora pra próxima?",
        "Ninguém acerta tudo sempre. Continue mandando ver!",
        "É assim que se aprende: bora seguir em frente!",
        "Você está no caminho certo, não desanime!",
        "Isso acontece até com os melhores. Próxima questão!",
        "Missão não cumprida… mas só dessa vez!",
        "Continue focado! Cada erro te deixa mais perto do acerto.",
        "Você está evoluindo, mesmo quando erra!",
    ];


    const { questionId, materialId } = useParams();
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [simulando, setSimulando] = useState(false);
    const [respostaAluno, setRespostaAluno] = useState<"Verdadeiro" | "Falso" | null>(null);

    const getCorrectAnswers = () => {
        try {
            return question?.correct_answers ? JSON.parse(question.correct_answers) : [];
        } catch {
            return [];
        }
    };
    const isRespostaCorreta = respostaAluno && getCorrectAnswers().includes(respostaAluno);


    // Fetch question
    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:3000/quizzes/${questionId}`)
            .then(res => res.json())
            .then(data => setQuestion(data))
            .finally(() => setLoading(false));
    }, [questionId]);

    const handleStartSimulacao = () => {
        setSimulando(true);
        setRespostaAluno(null); // sempre começa limpo!
    };

    // Função para encerrar simulação (zera tudo)
    const handleEndSimulacao = () => {
        setSimulando(false);
        setRespostaAluno(null); // limpa ao sair!
    };

    // Helper: parse options (stringified array)
    const getOptions = () => {
        try {
            return question?.options ? JSON.parse(question.options) : [];
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
                        pr: 10,
                        width: 'fit-content',         // <-- Se quiser adaptar ao conteúdo
                        maxWidth: '90vw',
                        minHeight: simulando ? 320 : 400,
                        mx: isMobile ? 1 : 3,
                        borderRadius: 4,
                        boxShadow: 8,
                        background: 'linear-gradient(120deg,#fff,#e0f7fa 90%)',
                        p: isMobile ? 2 : 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        position: 'relative',
                        transition: 'max-width 0.3s, min-height 0.3s', // anima uma transição sutil
                    }}
                >

                    <CardContent sx={{ p: 0, pr: !simulando ? { xs: 7, sm: 10 } : 0 }}>
                        {/* Header: tipo e status + ações */}
                        <QuizQuestionHeader
                            type={question.type}
                            level={question.level}
                            status={question.status}
                            materialId={materialId}
                            questionId={question.question_id}
                            onEdit={() => navigate(`/home/quizzes/${materialId}/editar/${question.question_id}`)}
                            onValidate={() => { /* ação de validação */ }}
                            onDelete={() => { /* ação de exclusão */ }}
                            lottieUrl="/lotties/true_false.json" // ou dinâmico
                            hideActions={simulando}
                        />
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
                            <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={2}>
                                <Box display="flex" gap={3} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        sx={{
                                            opacity: simulando ? 1 : 0.7,
    cursor: simulando ? 'pointer' : 'not-allowed',
    pointerEvents: simulando ? 'auto' : 'none',
                                            minWidth: 120,
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            background: '#43a047',
                                            color: '#fff',
                                            fontSize: 18,
                                            border: '2px solid #388e3c',
                                            boxShadow: '0 2px 10px #c8e6c9',
                                            textTransform: 'none',
                                            '&:hover': { background: '#2e7d32' },
                                        }}
                                        disabled={!!respostaAluno && simulando}
                                        onClick={() => simulando && setRespostaAluno("Verdadeiro")}
                                    >
                                        Verdadeiro
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            opacity: simulando ? 1 : 0.7,
    cursor: simulando ? 'pointer' : 'not-allowed',
    pointerEvents: simulando ? 'auto' : 'none',
                                            minWidth: 120,
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            background: '#e53935',
                                            color: '#fff',
                                            fontSize: 18,
                                            border: '2px solid #b71c1c',
                                            boxShadow: '0 2px 10px #ffcdd2',
                                            textTransform: 'none',
                                            '&:hover': { background: '#b71c1c' },
                                        }}
                                        disabled={!!respostaAluno && simulando}
                                        onClick={() => simulando && setRespostaAluno("Falso")}
                                    >
                                        Falso
                                    </Button>
                                </Box>

                                {/* Feedback da resposta */}
                                {simulando && respostaAluno && (
                                    <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                                        {isRespostaCorreta ? (
                                            <>
                                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                                    Parabéns! Você acertou!
                                                </Typography>
                                                <CelebrationLottie style={{ width: 140, height: 140 }} />
                                                {question.guidance_on_success && (
                                                    <Typography color="primary" fontWeight="bold" textAlign="center" mt={2}>
                                                        {question.guidance_on_success}
                                                    </Typography>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="h6" color="error" fontWeight="bold">
                                                    {mensagensErro[Math.floor(Math.random() * mensagensErro.length)]}
                                                </Typography>
                                                <CelebrationLottie style={{ width: 140, height: 140 }} error />
                                                {question.guidance_on_error && (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            color="error"
                                                            fontWeight="bold"
                                                            sx={{ textAlign: "center", userSelect: "none" }}
                                                        >
                                                            {question.guidance_on_error}
                                                        </Typography>
                                                    </motion.div>
                                                )}
                                            </>

                                        )}
                                    </Box>
                                )}
                            </Box>
                        )}


                        {/* Outros tipos... adapte conforme necessário */}

                        {!simulando && (
                            <GuidanceSection
                                guidanceOnError={question.guidance_on_error}
                                guidanceOnSuccess={question.guidance_on_success}
                            />
                        )}
                    </CardContent>

                    <SimulationFab
                        simulando={simulando}
                        onStart={handleStartSimulacao}
                        onEnd={handleEndSimulacao}
                    />




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
                        {!simulando && (
                            <Fade in timeout={1200}>

                                <Chip
                                    icon={<QuizIcon />}
                                    label={`Pergunta já foi usada ${question.times_used} vezes`}
                                    color="primary"
                                    sx={{ fontWeight: 'bold', fontSize: isMobile ? 13 : 15, px: 2, mb: 1 }}
                                />
                            </Fade>
                        )}
                        {/* Aqui você pode adicionar uma animação ou mascote, se quiser */}
                        {/* Mascote/efeito se quiser */}
                    </Box>
                </Fade>

                {/* FAB para voltar - canto inferior direito, sempre visível */}

                {!simulando && (
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
                )}

            </Box>
        </Fade>
    );
}
