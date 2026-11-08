import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// public/ se sirve en la raíz
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
