import tailwindcss from '@tailwindcss/vite'; 
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    host: '0.0.0.0',  //can try on other devices in the same network
    strictPort: true, // if 3000 is not available, Vite will exit instead of trying the next available port
  },
});