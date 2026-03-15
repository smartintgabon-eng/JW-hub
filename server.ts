import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API handlers
import searchContentHandler from './api/search-content.js';
import generateContentHandler from './api/generate-content.js';
import getColorHandler from './api/get-color.js';

// Vercel Packages Integration (as requested)
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { get } from '@vercel/edge-config';

// Utility packages (as requested)
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adapter to convert Express req to Web Request
function createWebRequest(req: express.Request): Request {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // We stringify the body because express.json() already parsed it
    init.body = req.body ? JSON.stringify(req.body) : null;
  }

  return new Request(url, init);
}

// Adapter to convert Web Response to Express res
async function handleWebResponse(webRes: Response, res: express.Response) {
  res.status(webRes.status);
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (webRes.body) {
    const reader = webRes.body.getReader();
    try {
      let isDone = false;
      while (!isDone) {
        const { done, value } = await reader.read();
        isDone = done;
        if (!isDone) {
          res.write(value);
        }
      }
    } finally {
      res.end();
    }
  } else {
    const text = await webRes.text();
    res.send(text);
  }
}

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // Helper to unwrap default exports
  const getHandler = (handler: any) => handler.default || handler;

  // API Routes wrapper
  const wrapApiRoute = (handlerModule: any) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const webReq = createWebRequest(req);
      const handler = getHandler(handlerModule);
      const webRes = await handler(webReq);
      await handleWebResponse(webRes, res);
    } catch (e) {
      next(e);
    }
  };

  app.post('/api/search-content', wrapApiRoute(searchContentHandler));
  app.post('/api/generate-content', wrapApiRoute(generateContentHandler));
  app.post('/api/get-color', wrapApiRoute(getColorHandler));

  // Dummy endpoint to demonstrate Vercel packages integration
  app.get('/api/vercel-status', async (req, res) => {
    try {
      // @vercel/edge-config
      const configValue = process.env.EDGE_CONFIG ? await get('status') : 'Edge Config non configuré';
      
      // @vercel/postgres
      const dbStatus = process.env.POSTGRES_URL ? await sql`SELECT NOW()` : 'Postgres non configuré';
      
      // @vercel/blob
      const blobStatus = process.env.BLOB_READ_WRITE_TOKEN ? 'Prêt (put disponible)' : 'Blob non configuré';

      res.json({
        analytics: 'Actif (côté client)',
        speedInsights: 'Actif (côté client)',
        blob: blobStatus,
        postgres: dbStatus,
        edgeConfig: configValue,
        _putAvailable: !!put, // Just to ensure the import is used
        _utils: {
          date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          uuid: uuidv4()
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Error handling middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: 'Internal Server Error', details: String(err) });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
