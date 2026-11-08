import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// "public/" se sirve en la raíz: public/imagenes/rick.jpg → /imagenes/rick.jpg
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
