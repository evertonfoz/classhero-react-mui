import { Box, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import type { BoxProps, TextFieldProps } from '@mui/material';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  boxProps?: BoxProps;
  textFieldProps?: TextFieldProps;
  children?: ReactNode;
}

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  placeholder = 'Pesquisar...',
  boxProps,
  textFieldProps,
  children,
}: SearchFilterBarProps) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3} {...boxProps}>
      <TextField
        fullWidth
        placeholder={placeholder}
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        {...textFieldProps}
      />
      {children}
    </Box>
  );
}
