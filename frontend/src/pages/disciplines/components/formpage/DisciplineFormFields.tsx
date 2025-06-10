import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Course {
  course_id: string;
  name: string;
}

interface Props {
  nome: string;
  ementa: string;
  cargaHoraria: number | '';
  selectedCourses: Course[];
  setNome: (value: string) => void;
  setEmenta: (value: string) => void;
  setCargaHoraria: (value: number | '') => void;
  setSelectedCourses: (value: Course[]) => void;
  nomeInputRef?: React.RefObject<HTMLInputElement | null>;

}

export default function DisciplineFormFields({
  nome,
  ementa,
  cargaHoraria,
  selectedCourses,
  setNome,
  setEmenta,
  setCargaHoraria,
  setSelectedCourses,
  nomeInputRef ,
}: Props) {
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3000/courses/search?q=${search}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCourseOptions(data);
      } catch {
        setCourseOptions([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [search]);

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={3} width="100%">
      <TextField
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        fullWidth
        inputRef={nomeInputRef}
      />
      <TextField
        label="Ementa (opcional)"
        value={ementa}
        onChange={(e) => setEmenta(e.target.value)}
        fullWidth
        multiline
        minRows={2}
      />
      <TextField
        label="Carga Horária"
        value={cargaHoraria}
        onChange={(e) => setCargaHoraria(Number(e.target.value))}
        type="number"
        fullWidth
      />
      <Autocomplete
        multiple
        options={courseOptions}
        getOptionLabel={(option) => option.name}
        value={selectedCourses}
        onChange={(_, newValue) => setSelectedCourses(newValue)}
        onInputChange={(_, newInputValue) => setSearch(newInputValue)}
        loading={loadingCourses}
        filterSelectedOptions
        isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cursos associados"
            placeholder="Digite para buscar..."
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingCourses ? <CircularProgress color="inherit" size={20} /> : null}
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
