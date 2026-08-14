import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 배포된 백엔드(https://api.suyo-deploy.shop)는 로컬 개발 origin을 CORS로
    // 허용하지 않으므로, 개발 서버가 대신 프록시해서 브라우저에서는 같은
    // origin(/api/...)으로 보이게 한다. VITE_USE_REAL_API=true일 때만 의미가 있다.
    proxy: {
      '/api': {
        target: 'https://api.suyo-deploy.shop',
        changeOrigin: true,
        // changeOrigin은 Host 헤더만 바꾸고 Origin 헤더는 그대로 통과시킨다.
        // 브라우저가 보낸 "Origin: http://localhost:5173"이 그대로 넘어가면
        // 배포 서버의 CORS 필터가 (프록시를 거쳤어도) 여전히 막아버리므로 제거한다.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
          })
        },
      },
    },
  },
})
