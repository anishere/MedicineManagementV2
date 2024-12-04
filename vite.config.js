import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Để thiết bị khác truy cập
  server: {
    host: '0.0.0.0', // Cho phép lắng nghe trên tất cả các địa chỉ IP
    port: 5173      // Cổng đang sử dụng
  }
})

