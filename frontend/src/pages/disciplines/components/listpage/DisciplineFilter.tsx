import SearchFilterBar from '../../../../components/ui/SearchFilterBar';
import { InputLabel, FormControl, Select, MenuItem } from '@mui/material';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  workloadFilter: string;
  onWorkloadChange: (value: string) => void;
}

export default function DisciplineFilter({
  searchTerm,
  onSearchChange,
  workloadFilter,
  onWorkloadChange,
}: Props) {
  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Pesquisar por nome..."
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Carga Horária</InputLabel>
        <Select
          value={workloadFilter}
          onChange={(e) => onWorkloadChange(e.target.value)}
          label="Carga Horária"
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="30">30h</MenuItem>
          <MenuItem value="60">60h</MenuItem>
          <MenuItem value="90">90h</MenuItem>
        </Select>
      </FormControl>
    </SearchFilterBar>
  );
}
