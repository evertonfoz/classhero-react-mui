// src/components/CustomSnackbarProvider.tsx
import { SnackbarProvider } from 'notistack';
import type { SnackbarProviderProps } from 'notistack';
import type { ReactNode } from 'react';

interface CustomSnackbarProviderProps extends SnackbarProviderProps {
  children: ReactNode;
}

export default function CustomSnackbarProvider({
  children,
  ...props
}: CustomSnackbarProviderProps) {
  return (
    <SnackbarProvider {...props}>
      {children}
    </SnackbarProvider>
  );
}
