import { createServer } from 'vite'

const server = await createServer({
  server: { host: '::', port: 5173, strictPort: true, open: false },
})
await server.listen()
server.printUrls()
