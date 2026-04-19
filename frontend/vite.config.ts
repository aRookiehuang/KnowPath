import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/');
  if (normalizedId.includes('/node_modules/')) {
    if (normalizedId.includes('/@element-plus/icons-vue/')) {
      return 'element-icons';
    }
    if (normalizedId.includes('/element-plus/')) {
      return 'element-plus';
    }
    if (
      normalizedId.includes('/markdown-it/') ||
      normalizedId.includes('/highlight.js/') ||
      normalizedId.includes('/katex/') ||
      normalizedId.includes('/mermaid/')
    ) {
      return 'content-render';
    }
    if (normalizedId.includes('/chart.js/') || normalizedId.includes('/vue-chartjs/')) {
      return 'data-viz';
    }
    return 'vendor';
  }
  if (normalizedId.includes('/src/views/admin/')) {
    return 'admin-pages';
  }
  if (normalizedId.includes('/src/views/user/')) {
    return 'account-pages';
  }
  if (
    normalizedId.includes('/src/views/Learning') ||
    normalizedId.includes('/src/views/GoalConversation') ||
    normalizedId.includes('/src/components/learning/')
  ) {
    return 'learning-pages';
  }
  if (normalizedId.includes('/src/views/Home.vue') || normalizedId.includes('/src/components/home/')) {
    return 'marketing';
  }
};
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // 确保代理返回使用 UTF-8 编码
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
          });
        }
      }
    }
  }
});
