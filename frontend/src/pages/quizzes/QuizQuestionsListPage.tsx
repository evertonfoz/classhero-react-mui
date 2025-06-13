import {
    Box,
    Typography,
    TextField,
    useMediaQuery,
    useTheme,
    TableCell,
    TableRow,
    Tooltip,
    IconButton,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import QuizIcon from '@mui/icons-material/Quiz';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';
import PaginatedTable from '../../components/ui/PaginatedTable';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';


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
    extra: string | null;
}

const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivada',
    // Adicione outros se necessário
};

const typeLabels: Record<string, string> = {
    multiple_choice: 'Múltipla escolha',
    multiple_select: 'Múltiplas respostas',
    true_false: 'Verdadeiro ou Falso',
    fill_in_blank: 'Preenchimento',
    matching: 'Associação',
    ordering: 'Ordenação',
    short_answer: 'Resposta curta',
    // outros se precisar
};

const levelLabels: Record<string, string> = {
    básico: 'Básico',
    intermediário: 'Intermediário',
    avançado: 'Avançado',
    // Inclua outros se necessário
};


export default function QuizQuestionsListPage() {
    const { materialId } = useParams<{ materialId: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');



    const {
        data: questionsRaw = [],
        loading,
        currentPage,
        setCurrentPage,
        totalPages,
    } = usePaginatedFetch<QuizQuestion>(
        (page, limit) => {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (searchTerm) query.append('search', searchTerm);
            if (statusFilter) query.append('status', statusFilter);
            if (typeFilter) query.append('type', typeFilter);
            if (levelFilter) query.append('level', levelFilter);  // <- ADICIONADO
            return `http://localhost:3000/quizzes?material_id=${materialId}&${query.toString()}`;
        },
        [searchTerm, statusFilter, typeFilter, levelFilter, materialId], // <- ADICIONADO
    );

    const questions = Array.isArray(questionsRaw) ? questionsRaw : [];

    return (
        <PageContainer>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <QuizIcon />
                <Typography variant="h5" fontWeight="bold">
                    Questões do Quiz
                </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={3} width="100%">
                {/* Campo de texto ocupa todo o espaço */}
                <TextField
                    placeholder="Pesquisar por texto da questão..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setCurrentPage(1);
                        setSearchTerm(e.target.value);
                    }}
                    sx={{ flexGrow: 1 }} // ESSENCIAL: faz o campo crescer!
                />





                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel id="type-label" shrink>
                        Tipo
                    </InputLabel>
                    <Select
                        labelId="type-label"
                        label="Tipo"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        size="small"
                        displayEmpty
                        renderValue={
                            typeFilter !== ""
                                ? (selected) =>
                                    typeLabels[selected as string] || selected
                                : () => "Todos"
                        }
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="multiple_choice">Múltipla escolha</MenuItem>
                        <MenuItem value="multiple_select">Múltiplas respostas</MenuItem>
                        <MenuItem value="true_false">Verdadeiro ou Falso</MenuItem>
                        <MenuItem value="fill_in_blank">Preenchimento</MenuItem>
                        <MenuItem value="matching">Associação</MenuItem>
                        <MenuItem value="ordering">Ordenação</MenuItem>
                        <MenuItem value="short_answer">Resposta curta</MenuItem>
                    </Select>
                </FormControl>

                {/* Nível */}
                <FormControl sx={{ minWidth: 130 }}>
                    <InputLabel id="level-label" shrink>Nível</InputLabel>
                    <Select
                        labelId="level-label"
                        label="Nível"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        size="small"
                        displayEmpty
                        renderValue={
                            levelFilter !== ""
                                ? (selected) =>
                                    levelLabels[selected as string] || selected
                                : () => "Todos"
                        }
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="básico">Básico</MenuItem>
                        <MenuItem value="intermediário">Intermediário</MenuItem>
                        <MenuItem value="avançado">Avançado</MenuItem>
                    </Select>
                </FormControl>
                {/* Status */}
                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel id="status-label" shrink>
                        Status
                    </InputLabel>
                    <Select
                        labelId="status-label"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        // ESSENCIAL: mostra "Todos" quando value é ""
                        displayEmpty
                        renderValue={
                            statusFilter !== ""
                                ? (selected) =>
                                    selected === "draft"
                                        ? "Rascunho"
                                        : selected === "published"
                                            ? "Publicado"
                                            : selected
                                : () => "Todos"
                        }
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="draft">Rascunho</MenuItem>
                        <MenuItem value="published">Publicado</MenuItem>
                    </Select>
                </FormControl>
            </Box>


            <PaginatedTable
                items={questions}
                loading={loading}
                columns={
                    <>
                        <TableCell sx={{ minWidth: isMobile ? 120 : 250, fontWeight: 'bold', background: '#F4F6F8' }}>
                            Pergunta
                        </TableCell>
                        <TableCell sx={{ minWidth: isMobile ? 110 : 40, fontWeight: 'bold', background: '#F4F6F8' }}>
                            Tipo
                        </TableCell>

                        <TableCell sx={{ minWidth: isMobile ? 80 : 40, fontWeight: 'bold', background: '#F4F6F8' }}>
                            Nível
                        </TableCell>
                        <TableCell sx={{ minWidth: isMobile ? 100 : 40, fontWeight: 'bold', background: '#F4F6F8' }}>
                            Status
                        </TableCell>
                        <TableCell sx={{ minWidth: 36, fontWeight: 'bold', background: '#F4F6F8' }} align="center">
                            Ações
                        </TableCell>
                    </>
                }
                renderRow={(question) => (
                    <TableRow
                        key={question.question_id}
                        sx={{
                            backgroundColor: Number.parseInt(question.question_id.replace(/\D/g, '').slice(-2)) % 2 === 0 ? '#FAFAFA' : '#FFF',
                            '&:hover': { backgroundColor: '#F5F5F5' },
                            transition: 'background 0.2s',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/home/quizzes/${materialId}/visualizar/${question.question_id}`)}
                    >
                        <TableCell sx={{ fontWeight: 'bold', maxWidth: 360, whiteSpace: 'pre-line', py: 1.2, fontSize: '1.07rem' }}>
                            {question.question}
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                            {typeLabels[question.type] || question.type}
                        </TableCell>

                        <TableCell sx={{ py: 1.2 }}>{question.level}</TableCell>
                        <TableCell sx={{ py: 1.2 }}>{statusLabels[question.status] || question.status}</TableCell>
                        <TableCell align="center" sx={{ py: 1.2,minWidth: 44, maxWidth: 48  }}>
                            <Tooltip title="Visualizar">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation(); // evita trigger do onRow click
                                        navigate(`/home/quizzes/${materialId}/visualizar/${question.question_id}`);
                                    }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                )}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                minWidth={isMobile ? 280 : 500}
            />

        </PageContainer>
    );
}
