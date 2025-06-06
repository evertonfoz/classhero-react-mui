import type { SxProps, Theme, TableProps } from '@mui/material';
import { TableContainer, Paper, Table } from '@mui/material';
import type { ReactNode } from 'react';


interface ResponsiveTableProps extends TableProps {
  minWidth?: number;
  children: ReactNode;
  containerSx?: SxProps<Theme>;
}

export default function ResponsiveTable({
  children,
  minWidth = 650,
  containerSx,
  ...rest
}: ResponsiveTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 2,
        overflowX: 'auto',
        width: '100%',
        ...containerSx,
      }}
    >
      <Table stickyHeader sx={{ minWidth }} {...rest}>
        {children}
      </Table>
    </TableContainer>
  );
}
