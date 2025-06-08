import { Box, Button, Typography } from '@mui/material';
import PageContainer from '../../components/ui/PageContainer';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SuccessDialog from '../../components/ui/SuccessDialog';
import ClassFormFields from './components/formpage/ClassFormFields';

interface SelectedDiscipline {
  discipline: { discipline_id: string; name: string };
  teacher?: { email: string; name: string } | null;
}

interface StudentOption {
  email: string;
  name: string;
}

export default function ClassFormPage() {
  const [code, setCode] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [semester, setSemester] = useState<number | ''>('');
  const [disciplines, setDisciplines] = useState<SelectedDiscipline[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [formModified, setFormModified] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [origCode, setOrigCode] = useState('');
  const [origYear, setOrigYear] = useState<number | ''>('');
  const [origSemester, setOrigSemester] = useState<number | ''>('');
  const [origDisciplines, setOrigDisciplines] = useState<SelectedDiscipline[]>([]);
  const [origStudents, setOrigStudents] = useState<StudentOption[]>([]);

  const hasDisciplineWithTeacher = disciplines.some(d => d.teacher && d.teacher.email);

  useEffect(() => {
    const modified =
      code.trim() !== origCode.trim() ||
      year !== origYear ||
      semester !== origSemester ||
      JSON.stringify(disciplines) !== JSON.stringify(origDisciplines) ||
      JSON.stringify(students.map((s) => s.email).sort()) !==
      JSON.stringify(origStudents.map((s) => s.email).sort());
    setFormModified(modified);
  }, [code, year, semester, disciplines, students, origCode, origYear, origSemester, origDisciplines, origStudents]);

  const handleReset = () => {
    if (isEditMode) {
      setCode(origCode);
      setYear(origYear);
      setSemester(origSemester);
      setDisciplines(origDisciplines);
      setStudents(origStudents);
    } else {
      setCode('');
      setYear('');
      setSemester('');
      setDisciplines([]);
      setStudents([]);
    }
    setFormModified(false);
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchClass = async () => {
        const token = localStorage.getItem('access_token');
        try {
          const response = await fetch(`http://localhost:3000/classes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error();
          const { data } = await response.json();
          setCode(data.code);
          setYear(data.year);
          setSemester(data.semester);
          setDisciplines(
            (data.disciplines || []).map((cd: any) => ({
              discipline: { discipline_id: cd.discipline_id, name: cd.name },
              teacher: cd.teacher_email
                ? { email: cd.teacher_email, name: cd.teacher_name }
                : null,
            }))
          );
          setStudents((data.students || []).map((s: any) => ({ email: s.email, name: s.name })));

          setOrigCode(data.code);
          setOrigYear(data.year);
          setOrigSemester(data.semester);
          setOrigDisciplines(
            (data.disciplines || []).map((cd: any) => ({
              discipline: { discipline_id: cd.discipline_id, name: cd.name },
              teacher: cd.teacher_email
                ? { email: cd.teacher_email, name: cd.teacher_name }
                : null,
            }))
          );
          setOrigStudents((data.students || []).map((s: any) => ({ email: s.email, name: s.name })));
        } catch (err) {
          enqueueSnackbar('Erro ao carregar turma.', { variant: 'error' });
          navigate('/home/turmas');
        }
      };
      fetchClass();
    }
  }, [id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/classes${isEditMode ? `/${id}` : ''}`, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.trim(),
          year: Number(year),
          semester: Number(semester),
          disciplines: disciplines.map((d) => ({
            discipline_id: d.discipline.discipline_id,
            teacher_email: d.teacher?.email || null,
          })),
          student_emails: students.map((s) => s.email),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        enqueueSnackbar(result?.message || 'Erro ao salvar turma', { variant: 'error' });
        return;
      }
      if (isEditMode) {
        enqueueSnackbar('Turma atualizada com sucesso!', { variant: 'success' });
        navigate('/home/turmas');
      } else {
        setDialogOpen(true);
      }
    } catch (err: any) {
      enqueueSnackbar(`Erro ao cadastrar turma: ${err.message}`, { variant: 'error' });
    }
  };

  return (
    <PageContainer>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {isEditMode ? 'Editar Turma' : 'Nova Turma'}
      </Typography>

      <ClassFormFields
        code={code}
        year={year}
        semester={semester}
        disciplines={disciplines}
        students={students}
        setCode={setCode}
        setYear={setYear}
        setSemester={setSemester}
        setDisciplines={setDisciplines}
        setStudents={setStudents}
      />

      <Box display="flex" gap={2}>
        <Button variant="outlined" disabled={!formModified} onClick={handleReset}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            !formModified ||
            !code.trim() ||
            !year ||
            !semester ||
            !hasDisciplineWithTeacher
          }
          onClick={handleSubmit}
        >

          {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
        </Button>
      </Box>

      <SuccessDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Turma cadastrada com sucesso!"
        question="Deseja cadastrar outra turma?"
        onFinalize={() => navigate('/home/turmas')}
        onAgain={() => {
          handleReset();
          setDialogOpen(false);
        }}
      />
    </PageContainer>
  );
}
