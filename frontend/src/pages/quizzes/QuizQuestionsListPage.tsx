import {
    Box,
    Typography,
    TextField,
    useMediaQuery,
    useTheme,
    TableCell,
    TableRow,
} from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import QuizIcon from '@mui/icons-material/Quiz';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';
import PaginatedTable from '../../components/ui/PaginatedTable';

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

export default function QuizQuestionsListPage() {
    const { materialId } = useParams<{ materialId: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');

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
            return `http://localhost:3000/quizzes?material_id=${materialId}&${query.toString()}`;
        },
        [searchTerm, materialId],
    );

    const questions = Array.isArray(questionsRaw) ? questionsRaw : [];

    return (
        <PageContainer>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <QuizIcon />
                <Typography variant="h5" fontWeight="bold">
                    Questões do Quiz
                </Typography>
            </Box>

            <TextField
                fullWidth
                placeholder="Pesquisar por texto da questão..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                    setCurrentPage(1);
                    setSearchTerm(e.target.value);
                }}
                sx={{ mb: 3 }}
            />

            <PaginatedTable
                items={questions}
                loading={loading}
                columns={
                    <>
                        <TableCell sx={{ minWidth: isMobile ? 120 : 200 }}>Pergunta</TableCell>
                        <TableCell sx={{ minWidth: isMobile ? 80 : 140 }}>Nível</TableCell>
                        <TableCell sx={{ minWidth: isMobile ? 100 : 160 }}>Status</TableCell>
                    </>
                }
                renderRow={(question) => (
                    <TableRow key={question.question_id}>
                        <TableCell sx={{ fontWeight: 'bold', maxWidth: 360, whiteSpace: 'pre-line' }}>
                            {question.question}
                        </TableCell>
                        <TableCell>{question.level}</TableCell>
                        <TableCell>{question.status}</TableCell>
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
