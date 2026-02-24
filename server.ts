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

  // API Routes
  app.post('/api/search-content', (req, res) => searchContentHandler(req, res));
  app.post('/api/generate-content', (req, res) => generateContentHandler(req, res));
  app.post('/api/guess-color', (req, res) => guessColorHandler(req, res));

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

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
