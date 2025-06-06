import {
  Box,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function CourseFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <TextField
        fullWidth
        placeholder="Pesquisar por nome ou sigla..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          label="Status"
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Ativo</MenuItem>
          <MenuItem value="false">Inativo</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
