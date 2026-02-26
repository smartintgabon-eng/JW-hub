import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import searchContentHandler from "../api/search-content.js";
import generateContentHandler from "../api/generate-content.js";

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
    if (!ai) return res.status(500).json({ error: 'API Gemini non initialisée.' });
    const { colorInput, language } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyse cette couleur : "${colorInput}". Donne une description poétique et technique (nom de la couleur, ambiance, ce qu'elle évoque). Réponds en ${language === 'fr' ? 'français' : language === 'es' ? 'espagnol' : 'anglais'}. Sois concis (2-3 phrases).`,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, hex: { type: Type.STRING } }, required: ["description", "hex"] }
        }
      });
      const fullText = response.text || "{}";
      const parsed = JSON.parse(fullText);
      return res.status(200).json(parsed);
    } catch (error) {
      console.error("Guess Color Error:", error);
      return res.status(500).json({ message: "Erreur lors de l'analyse de la couleur." });
    }
  });

  app.post('/api/search-content', searchContentHandler);
  app.post('/api/generate-content', generateContentHandler);

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
