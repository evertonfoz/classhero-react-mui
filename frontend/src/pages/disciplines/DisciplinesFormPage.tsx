import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SuccessDialog from '../../components/ui/SuccessDialog';
import DisciplineFormFields from './components/formpage/DisciplineFormFields';

interface Course {
  course_id: string;
  name: string;
}

export default function DisciplinesFormPage() {
  const [nome, setNome] = useState('');
  const [ementa, setEmenta] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState<number | ''>('');
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [formModified, setFormModified] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [originalNome, setOriginalNome] = useState('');
  const [originalEmenta, setOriginalEmenta] = useState('');
  const [originalCargaHoraria, setOriginalCargaHoraria] = useState<number | ''>('');
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);

  useEffect(() => {
    const modificado =
      nome.trim() !== originalNome.trim() ||
      ementa.trim() !== originalEmenta.trim() ||
      cargaHoraria !== originalCargaHoraria ||
      JSON.stringify(selectedCourses.map((c) => c.course_id).sort()) !==
      JSON.stringify(originalCourses.map((c) => c.course_id).sort());

    setFormModified(modificado);
  }, [nome, ementa, cargaHoraria, selectedCourses, originalNome, originalEmenta, originalCargaHoraria, originalCourses]);

  const handleReset = () => {
    if (isEditMode) {
      setNome(originalNome);
      setEmenta(originalEmenta);
      setCargaHoraria(originalCargaHoraria);
      setSelectedCourses(originalCourses);
    } else {
      setNome('');
      setEmenta('');
      setCargaHoraria('');
      setSelectedCourses([]);
    }
    setFormModified(false);
  };

  useEffect(() => {
  if (isEditMode) {
    const fetchDiscipline = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch(`http://localhost:3000/disciplines/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error();

        const { data } = await response.json();

        // Preenche campos principais
        setNome(data.name || '');
        setEmenta(data.syllabus || '');
        setCargaHoraria(data.workload_hours || '');
        setOriginalNome(data.name || '');
        setOriginalEmenta(data.syllabus || '');
        setOriginalCargaHoraria(data.workload_hours || '');

        // Preenche os cursos associados
        const coursesFromServer = data.courses || [];
        setSelectedCourses(
          coursesFromServer.map((c: any) => ({
            course_id: c.course_id,
            name: c.name,
          }))
        );
      } catch (err) {
        enqueueSnackbar('Erro ao carregar disciplina.', { variant: 'error' });
        navigate('/home/disciplinas');
      }
    };

    fetchDiscipline();
  }
}, [id]);



  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/disciplines${isEditMode ? `/${id}` : ''}`, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nome.trim(),
          syllabus: ementa.trim(),
          workload_hours: Number(cargaHoraria),
          course_ids: selectedCourses.map((c) => c.course_id), // 👈 aqui
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        enqueueSnackbar(result?.message || 'Erro ao salvar disciplina', { variant: 'error' });
        return;
      }

      if (isEditMode) {
        enqueueSnackbar('Disciplina atualizada com sucesso!', { variant: 'success' });
        navigate('/home/disciplinas');
      } else {
        setDialogOpen(true);
      }
    } catch (err: any) {
      enqueueSnackbar(`Erro ao cadastrar disciplina: ${err.message}`, { variant: 'error' });
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
        {isEditMode ? 'Editar Disciplina' : 'Nova Disciplina'}
      </Typography>

      <DisciplineFormFields
        nome={nome}
        ementa={ementa}
        cargaHoraria={cargaHoraria}
        setNome={setNome}
        setEmenta={setEmenta}
        setCargaHoraria={setCargaHoraria}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
      />


      <Box display="flex" gap={2}>
        <Button variant="outlined" disabled={!formModified} onClick={handleReset}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!formModified || !nome.trim() || !cargaHoraria}
          onClick={handleSubmit}
        >
          {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
        </Button>
      </Box>

      <SuccessDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Disciplina cadastrada com sucesso!"
        question="Deseja cadastrar outra disciplina?"
        onFinalize={() => navigate('/home/disciplinas')}
        onAgain={() => {
          handleReset();
          setDialogOpen(false);
        }}
      />
    </Box>
  );
}
