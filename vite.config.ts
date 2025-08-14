import { defineConfig, type Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function apiMiddleware(): Plugin {
  return {
    name: 'wf-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url || '';
          if (!url.startsWith('/api/')) return next();

          const routeMap: Record<string, () => Promise<(req: Request) => Promise<Response>>> = {
            '/api/generate-workflow': async () => (await import('./api/generate-workflow.ts')).default,
            '/api/test-workflow': async () => (await import('./api/test-workflow.ts')).default,
            '/api/import-to-n8n': async () => (await import('./api/import-to-n8n.ts')).default,
            '/api/workflow-catalog': async () => (await import('./api/workflow-catalog.ts')).default,
          };

          const pathname = url.split('?')[0];
          const loadHandler = routeMap[pathname];
          if (!loadHandler) return next();

          const handler = await loadHandler();

          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const bodyBuf = chunks.length ? Buffer.concat(chunks) : undefined;
              const request = new Request('http://localhost' + (req.url || ''), {
                method: req.method,
                headers: new Headers(req.headers as any),
                body: bodyBuf && req.method && !['GET', 'HEAD'].includes(req.method) ? bodyBuf : undefined,
              });
              const response = await handler(request);
              res.statusCode = response.status;
              response.headers.forEach((value, key) => res.setHeader(key, value));
              const respBody = await response.arrayBuffer();
              res.end(Buffer.from(respBody));
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: { code: 'dev_adapter_error', message: e?.message || 'Unknown error' } }));
            }
          });
        } catch (e) {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Make env vars (e.g., GROQ_API_KEY) available to dev server runtime
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiMiddleware()],
    server: {
      host: 'localhost',
      port: 5173,
      hmr: {
        host: 'localhost',
        port: 5173,
        protocol: 'ws',
      },
      // Keep proxy available if you prefer to run a standalone backend at 3001.
      // The middleware above will handle /api/* first during dev.
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});