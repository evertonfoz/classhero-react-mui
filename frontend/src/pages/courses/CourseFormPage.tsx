import {
    Box,
    Button,
    Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SuccessDialog from '../../components/ui/SuccessDialog';
import { useParams } from 'react-router-dom';
import CourseFormFields from './components/formpage/CourseFormFields';


export default function CourseFormPage() {
    const [nome, setNome] = useState('');
    const [sigla, setSigla] = useState('');
    const [ativo, setAtivo] = useState(true);
    const [formModified, setFormModified] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar(); // 🔔

    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [originalNome, setOriginalNome] = useState('');
    const [originalSigla, setOriginalSigla] = useState('');
    const [originalAtivo, setOriginalAtivo] = useState(true);



    useEffect(() => {
        const foiModificado =
            nome.trim() !== originalNome.trim() ||
            sigla.trim().toUpperCase() !== originalSigla.trim().toUpperCase() ||
            ativo !== originalAtivo;

        setFormModified(foiModificado);
    }, [nome, sigla, ativo, originalNome, originalSigla, originalAtivo]);


    const handleReset = () => {
        if (isEditMode) {
            setNome(originalNome);
            setSigla(originalSigla);
            setAtivo(originalAtivo);
        } else {
            setNome('');
            setSigla('');
            setAtivo(true);
        }
        setFormModified(false);
    };


    useEffect(() => {
        if (isEditMode) {
            const fetchCourse = async () => {
                const token = localStorage.getItem('access_token');
                try {
                    const response = await fetch(`http://localhost:3000/courses/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.ok) throw new Error('Erro ao buscar curso');

                    const data = await response.json();
                    setNome(data.data.name || '');
                    setSigla(data.data.acronym || '');
                    setAtivo(data.data.status === 'active');

                    setOriginalNome(data.data.name || '');
                    setOriginalSigla(data.data.acronym || '');
                    setOriginalAtivo(data.data.status === 'active')
                } catch (error) {
                    enqueueSnackbar('Erro ao carregar curso para edição.', { variant: 'error' });
                    navigate('/home/cursos'); // Redireciona se houver erro
                }
            };

            fetchCourse();
        }
    }, [id]);


    const handleSubmit = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://localhost:3000/courses${isEditMode ? `/${id}` : ''}`, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: nome.trim(),
                    acronym: sigla.trim().toUpperCase(),
                    status: ativo ? 'active' : 'inactive',
                }),
            });


            const result = await response.json();

            if (!response.ok) {
                let message = result?.message || 'Erro ao criar curso';
                enqueueSnackbar(message, { variant: 'error' });
                return;
            }

            if (isEditMode) {
                enqueueSnackbar('Curso atualizado com sucesso!', { variant: 'success' });
                navigate('/home/cursos');
            }
            else {
                setDialogOpen(true);
            }
        } catch (error: any) {
            enqueueSnackbar(`Erro ao cadastrar curso: ${error.message}`, { variant: 'error' });
        }
    };

    return (
        <Box
            sx={{
                px: 4,
                py: 4,
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
            }}
        >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Novo Curso
            </Typography>

            <CourseFormFields
                nome={nome}
                sigla={sigla}
                ativo={ativo}
                setNome={setNome}
                setSigla={setSigla}
                setAtivo={setAtivo}
            />

            <Box display="flex" gap={2}>
                <Button
                    variant="outlined"
                    disabled={!formModified}
                    onClick={handleReset}
                >
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    disabled={!formModified || !nome.trim() || !sigla.trim()}
                    onClick={handleSubmit}
                >
                    {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>



            </Box>

            <SuccessDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={isEditMode ? 'Curso atualizado com sucesso!' : 'Curso cadastrado com sucesso!'}
                question="Deseja cadastrar outro curso?"
                onFinalize={() => navigate('/home/cursos')}
                onAgain={() => {
                    handleReset();
                    setDialogOpen(false);
                }}
            />


        </Box>
    );
}
