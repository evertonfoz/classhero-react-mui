import {
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import { useState } from 'react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    all: boolean;
    notValidated: boolean;
    is_a_admin: boolean;
    is_a_teacher: boolean;
    is_a_student: boolean;
  };
  onToggleFilter: (key: keyof FilterBarProps['filters']) => void;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  filters,
  onToggleFilter,
}: FilterBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filterOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'notValidated', label: 'Não validados' },
    { key: 'is_a_admin', label: 'Admins' },
    { key: 'is_a_teacher', label: 'Professores' },
    { key: 'is_a_student', label: 'Estudantes' },
  ] as const;

  const handleClick = (key: keyof FilterBarProps['filters']) => {
    onToggleFilter(key);
    if (isMobile) handleMenuClose();
  };

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Pesquisar por email ou nome..."
      boxProps={{ alignItems: 'center' }}
      textFieldProps={{ sx: { flexGrow: 1, minWidth: 240 } }}
    >
      {isMobile ? (
        <>
          <Button variant="outlined" onClick={handleMenuClick}>
            Filtros
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            {filterOptions.map((filter) => (
              <MenuItem
                key={filter.key}
                onClick={() => handleClick(filter.key)}
                selected={filters[filter.key]}
              >
                {filters[filter.key] ? '✅' : '❌'} {filter.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        filterOptions.map((filter) => (
          <Box
            key={filter.key}
            onClick={() => handleClick(filter.key)}
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: filters[filter.key] ? '#fff' : '#333',
              backgroundColor: filters[filter.key] ? '#4A90E2' : '#e0e0e0',
              '&:hover': {
                backgroundColor: filters[filter.key] ? '#357acc' : '#d5d5d5',
              },
            }}
          >
            {filter.label}
          </Box>
        ))
      )}
    </SearchFilterBar>
  );
}