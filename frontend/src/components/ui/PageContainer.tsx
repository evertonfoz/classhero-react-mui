import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface PageContainerProps extends BoxProps {
  children: ReactNode;
}

export default function PageContainer({ children, sx, ...rest }: PageContainerProps) {
  return (
    <Box
      sx={{
        px: 4,
        py: 4,
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
