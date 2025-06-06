import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
  const [originalSelectedCourses, setOriginalSelectedCourses] = useState<Course[]>([]);
  const [formModified, setFormModified] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [originalNome, setOriginalNome] = useState('');
  const [originalEmenta, setOriginalEmenta] = useState('');
  const [originalCargaHoraria, setOriginalCargaHoraria] = useState<number | ''>('');

  useEffect(() => {
    const modificado =
      nome.trim() !== originalNome.trim() ||
      ementa.trim() !== originalEmenta.trim() ||
      cargaHoraria !== originalCargaHoraria ||
      JSON.stringify(selectedCourses.map(c => c.course_id).sort()) !== JSON.stringify(originalSelectedCourses.map(c => c.course_id).sort());

    setFormModified(modificado);
  }, [nome, ementa, cargaHoraria, selectedCourses, originalNome, originalEmenta, originalCargaHoraria, originalSelectedCourses]);

  const handleReset = () => {
    if (isEditMode) {
      setNome(originalNome);
      setEmenta(originalEmenta);
      setCargaHoraria(originalCargaHoraria);
      setSelectedCourses(originalSelectedCourses);
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
          setNome(data.name || '');
          setEmenta(data.syllabus || '');
          setCargaHoraria(data.workload_hours || '');
          setSelectedCourses(data.courses || []);
          setOriginalSelectedCourses(data.courses || []);

          setOriginalNome(data.name || '');
          setOriginalEmenta(data.syllabus || '');
          setOriginalCargaHoraria(data.workload_hours || '');
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
          course_ids: selectedCourses.map((c) => c.course_id),
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
        selectedCourses={selectedCourses}
        setNome={setNome}
        setEmenta={setEmenta}
        setCargaHoraria={setCargaHoraria}
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

      <Dialog
        open={dialogOpen}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setDialogOpen(false);
          }
        }}
        PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="h6" component="span" fontWeight="bold">
            Disciplina cadastrada com sucesso!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Deseja cadastrar outra disciplina?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/home/disciplinas')}>
            Finalizar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleReset();
              setDialogOpen(false);
            }}
            autoFocus
            sx={{ whiteSpace: 'nowrap', minWidth: 160 }}
          >
            Cadastrar outra
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
