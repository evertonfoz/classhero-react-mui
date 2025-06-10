import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface DisciplineOption {
  discipline_id: string;
  name: string;
}

interface TeacherOption {
  email: string;
  name: string;
}

interface StudentOption {
  email: string;
  name: string;
}

interface SelectedDiscipline {
  discipline: DisciplineOption;
  teacher?: TeacherOption | null;
  class_discipline_id?: string;
}

interface Props {
  code: string;
  year: number | '';
  semester: number | '';
  disciplines: SelectedDiscipline[];
  students: StudentOption[];
  setCode: (v: string) => void;
  setYear: (v: number | '') => void;
  setSemester: (v: number | '') => void;
  setDisciplines: (v: SelectedDiscipline[]) => void;
  setStudents: (v: StudentOption[]) => void;
  teacherOptions: TeacherOption[];
  setTeacherOptions: (v: TeacherOption[]) => void;
  studentOptions: StudentOption[];
  setStudentOptions: (v: StudentOption[]) => void;
  nomeInputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function ClassFormFields({
  code,
  year,
  semester,
  disciplines,
  students,
  setCode,
  setYear,
  setSemester,
  setDisciplines,
  setStudents,
  teacherOptions,
  setTeacherOptions,
  studentOptions,
  setStudentOptions,
  nomeInputRef ,
}: Props) {
  const [disciplineOptions, setDisciplineOptions] = useState<DisciplineOption[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchDis, setSearchDis] = useState('');
  const [searchStu, setSearchStu] = useState('');
  const navigate = useNavigate();
  const { id: classId } = useParams(); // <- "id" vem de /turmas/editar/:id

  useEffect(() => {
    const fetchDisciplines = async () => {
      setLoadingDisciplines(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3000/disciplines/search?q=${searchDis}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setDisciplineOptions(data);
      } catch {
        setDisciplineOptions([]);
      } finally {
        setLoadingDisciplines(false);
      }
    };
    fetchDisciplines();
  }, [searchDis]);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:3000/users/all?is_a_teacher=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data } = await res.json();
        setTeacherOptions(data);
      } catch {
        setTeacherOptions([]);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `http://localhost:3000/users/all?is_a_student=true&search=${searchStu}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const { data } = await res.json();
        setStudentOptions(data);
      } catch {
        setStudentOptions([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [searchStu]);

  const handleDisciplineChange = (_: any, values: DisciplineOption[]) => {
    const updated = values.map((d) => {
      const existing = disciplines.find((sd) => sd.discipline.discipline_id === d.discipline_id);
      return existing || { discipline: d, teacher: null };
    });
    setDisciplines(updated);
  };

  const handleTeacherSelect = (index: number, teacher: TeacherOption | null) => {
    const updated = [...disciplines];
    updated[index].teacher = teacher;
    setDisciplines(updated);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={3} width="100%">
      {/* Código, ano, semestre */}
      <Box display="flex" gap={2}>
        <TextField
          label="Código"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          fullWidth
        inputRef={nomeInputRef}
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />

        <TextField
          label="Ano"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ maxWidth: 150 }}
        />
        <TextField
          label="Semestre"
          type="number"
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          sx={{ maxWidth: 150 }}
        />
      </Box>

      {/* Disciplinas */}
      <Autocomplete
        multiple
        options={disciplineOptions}
        getOptionLabel={(o) => o.name}
        value={disciplines.map((d) => d.discipline)}
        onChange={handleDisciplineChange}
        onInputChange={(_, value) => setSearchDis(value)}
        loading={loadingDisciplines}
        filterSelectedOptions
        isOptionEqualToValue={(o, v) => o.discipline_id === v.discipline_id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Disciplinas"
            placeholder="Digite para buscar..."
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingDisciplines ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Professores por disciplina + botão de temas */}
      {disciplines.map((sd, i) => (
        <Box key={sd.discipline.discipline_id} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Professor para {sd.discipline.name}</InputLabel>
            <Select
              value={
                teacherOptions.some((t) => t.email === sd.teacher?.email)
                  ? sd.teacher?.email
                  : ''
              }
              label={`Professor para ${sd.discipline.name}`}
              onChange={(e) => {
                const teacher = teacherOptions.find((t) => t.email === e.target.value);
                handleTeacherSelect(i, teacher || null);
              }}
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {teacherOptions.map((t) => (
                <MenuItem key={t.email} value={t.email}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {sd.teacher && sd.class_discipline_id && classId && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() =>
                navigate(`/home/turmas/${classId}/disciplinas/${sd.class_discipline_id}/temas`, {
                  state: {
                    disciplineName: sd.discipline.name,
                    teacherName: sd.teacher?.name || '',
                    classCode: code
                  }
                })
              }
            >
              Gerenciar Temas
            </Button>
          )}
        </Box>
      ))}

      {/* Alunos */}
      <Autocomplete
        multiple
        options={studentOptions}
        getOptionLabel={(o) => o.name}
        value={students}
        onChange={(_, v) => setStudents(v)}
        onInputChange={(_, val) => setSearchStu(val)}
        loading={loadingStudents}
        filterSelectedOptions
        isOptionEqualToValue={(o, v) => o.email === v.email}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Alunos"
            placeholder="Buscar alunos..."
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
}
