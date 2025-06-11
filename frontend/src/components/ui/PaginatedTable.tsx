import { Box, CircularProgress, Pagination, TableBody, TableHead, TableRow } from '@mui/material';
import type { ReactNode } from 'react';
import ResponsiveTable from './ResponsiveTable';

interface PaginatedTableProps<T> {
  items: T[];
  loading: boolean;
  columns: ReactNode;
  renderRow: (item: T) => ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  minWidth?: number;
}

export default function PaginatedTable<T>({
  items,
  loading,
  columns,
  renderRow,
  currentPage,
  totalPages,
  onPageChange,
  minWidth,
}: PaginatedTableProps<T>) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ResponsiveTable minWidth={minWidth}>
        <TableHead>
          <TableRow>{columns}</TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => renderRow(item))}
        </TableBody>
      </ResponsiveTable>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, value) => onPageChange(value)}
        sx={{ mt: 0.5, display: 'flex', justifyContent: 'center' }}
      />
    </>
  );
}
