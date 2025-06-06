import { Box, TextField } from '@mui/material';

interface Props {
  nome: string;
  ementa: string;
  cargaHoraria: number | '';
  setNome: (value: string) => void;
  setEmenta: (value: string) => void;
  setCargaHoraria: (value: number | '') => void;
}

export default function DisciplineFormFields({
  nome,
  ementa,
  cargaHoraria,
  setNome,
  setEmenta,
  setCargaHoraria,
}: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Nome da Disciplina *"
        variant="outlined"
        value={nome}
        onChange={(e) => {
          const valor = e.target.value;
          const formatado = valor.charAt(0).toUpperCase() + valor.slice(1);
          setNome(formatado);
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Ementa"
        variant="outlined"
        multiline
        rows={3}
        value={ementa}
        onChange={(e) => setEmenta(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Carga Horária *"
        type="number"
        inputProps={{ min: 1 }}
        value={cargaHoraria}
        onChange={(e) => setCargaHoraria(Number(e.target.value) || '')}
        sx={{ mb: 3, width: 200 }}
      />
    </>
  );
}
