import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so phones on the same Wi-Fi can open the Network URL.
    host: true,
    port: 5173,
    // Fail clearly if another checkout is already serving this port.
    strictPort: true,
    open: true,
  },
})
