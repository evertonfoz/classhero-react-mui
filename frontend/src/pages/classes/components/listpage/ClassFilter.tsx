import { Box, TextField } from '@mui/material';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ClassFilter({ searchTerm, onSearchChange }: Props) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <TextField
        fullWidth
        placeholder="Pesquisar por código..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </Box>
  );
}
