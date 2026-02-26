import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import searchContentHandler from './api/search-content.js';
import generateContentHandler from './api/generate-content.js';
import guessColorHandler from './api/guess-color.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // Helper to unwrap default exports
  const getHandler = (handler: any) => handler.default || handler;

  // API Routes
  app.post('/api/search-content', async (req, res, next) => {
    try {
      await getHandler(searchContentHandler)(req, res);
    } catch (e) {
      next(e);
    }
  });
  app.post('/api/generate-content', async (req, res, next) => {
    try {
      await getHandler(generateContentHandler)(req, res);
    } catch (e) {
      next(e);
    }
  });
  app.post('/api/guess-color', async (req, res, next) => {
    try {
      await getHandler(guessColorHandler)(req, res);
    } catch (e) {
      next(e);
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
    res.status(500).json({ error: 'Internal Server Error', details: String(err) });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
