import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 确保 @ 符号正确指向你的 src 目录
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,      // 明确前端运行在 3000
    host: '0.0.0.0', // 允许局域网访问
    strictPort: true, // 如果 3000 被占用就报错，而不是随机换端口
  },
});
/// <reference types="vite/client" />