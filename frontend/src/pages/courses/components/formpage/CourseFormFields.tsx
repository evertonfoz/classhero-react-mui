import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

interface Props {
  nome: string;
  sigla: string;
  ativo: boolean;
  setNome: (value: string) => void;
  setSigla: (value: string) => void;
  setAtivo: (value: boolean) => void;
}

export default function CourseFormFields({
  nome,
  sigla,
  ativo,
  setNome,
  setSigla,
  setAtivo,
}: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Nome do Curso *"
        variant="outlined"
        value={nome}
        onChange={(e) => {
          const valor = e.target.value;
          const formatado = valor.charAt(0).toUpperCase() + valor.slice(1);
          setNome(formatado);
        }}
        sx={{ mb: 2 }}
      />

      <Box display="flex" alignItems="center" width="100%" gap={2} sx={{ mb: 3 }}>
        <TextField
          label="Sigla *"
          variant="outlined"
          value={sigla}
          onChange={(e) => setSigla(e.target.value.toUpperCase())}
          inputProps={{ maxLength: 5 }}
          sx={{ width: 160 }}
        />
        <Box flexGrow={1} />
        <FormControlLabel
          control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
          label="Curso Ativo"
        />
      </Box>
    </>
  );
}
