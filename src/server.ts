import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // Pour parser les corps de requête JSON

  // Initialisation de GoogleGenAI (à faire avant les routes API)
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn('GEMINI_API_KEY non défini. Les fonctionnalités IA peuvent être limitées.');
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post('/api/guess-color', async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: 'API Gemini non initialisée.' });
    }

    const { colorInput } = req.body;

    if (!colorInput) {
      return res.status(400).json({ error: 'colorInput est requis.' });
    }

    try {
      const prompt = `Devine la couleur basée sur la description ou le code hexadécimal suivant : "${colorInput}". Réponds en JSON avec la couleur hexadécimale la plus proche (ex: #RRGGBB) et une courte description de la couleur en français. Si c'est un code hexadécimal valide, retourne-le directement. Si c'est une description, interprète-la.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING, description: 'Le code hexadécimal de la couleur (ex: #RRGGBB)' },
              description: { type: Type.STRING, description: 'Une courte description de la couleur en français' },
            },
            required: ['hex', 'description'],
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, // Utilisation de LOW pour une réponse rapide
        },
      });

      const textResponse = response.text;
      if (textResponse) {
        const parsedResponse = JSON.parse(textResponse);
        res.json(parsedResponse);
      } else {
        res.status(500).json({ error: "Aucune réponse de l'IA." });
      }
    } catch (error: any) {
      console.error('Erreur lors de la devinette de la couleur:', error);
      res.status(500).json({ error: "Erreur interne du serveur lors de la devinette de la couleur.", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // En production, servir les fichiers statiques de Vite
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
