import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite acesso via 0.0.0.0
    watch: {
      usePolling: true, // força verificação de arquivos para hot reload funcionar no Docker
    },
    port: 5173,
  },
});
