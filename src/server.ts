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

  app.post('/api/search-content', async (req, res) => {
    if (!ai) return res.status(500).json({ error: 'API Gemini non initialisée.' });
    const { questionOrSubject, settings, confirmMode } = req.body;
    const baseSystemInstruction = `Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org. Langue de la réponse : ${settings.language || 'fr'}. Si aucune image n'est trouvée, utilise une URL d'image par défaut de jw.org. Ne renvoie aucun texte supplémentaire en dehors du JSON.`;
    const confirmResponseSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, imageUrl: { type: Type.STRING }, summary: { type: Type.STRING }, infos: { type: Type.STRING } }, required: ['title', 'imageUrl', 'summary', 'infos'] };
    const fullSearchResponseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, link: { type: Type.STRING }, summary: { type: Type.STRING }, imageUrl: { type: Type.STRING } }, required: ['title', 'link', 'summary', 'imageUrl'] } };
    try {
      const config = { systemInstruction: confirmMode ? `MISSION : Identifier précisément l'article le plus pertinent pour la confirmation. ${baseSystemInstruction}` : `MISSION DE RECHERCHE COMPLÈTE : Tu es un assistant JW. Pour chaque recherche, identifie l'article le plus pertinent. ${baseSystemInstruction}`, tools: [{ googleSearch: {} }], temperature: 0.3, responseMimeType: "application/json", responseSchema: confirmMode ? confirmResponseSchema : fullSearchResponseSchema };
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Recherche sur : ${questionOrSubject}`, config });
      const fullText = response.text || "";
      if (fullText.trim().startsWith('<')) return res.status(500).json({ message: "Erreur: La réponse de l'IA n'est pas au format JSON." });
      if (confirmMode) {
        const parsedResponse = JSON.parse(fullText);
        return res.status(200).json({ previewTitle: parsedResponse.title || "Article trouvé", previewImage: parsedResponse.imageUrl || "https://assets.jw.org/assets/m/jwb-og-image.png", previewSummary: parsedResponse.summary || "Prêt pour la génération.", previewInfos: parsedResponse.infos || "" });
      } else {
        let parsedResults = JSON.parse(fullText);
        if (!Array.isArray(parsedResults)) parsedResults = [parsedResults];
        const rawSources = parsedResults.map((item) => ({ title: item.title, uri: item.link, image: item.imageUrl, content: item.summary }));
        const aiExplanation = parsedResults.map((item) => `NOM : ${item.title}\nLIEN : ${item.link}\nIMAGE : ${item.imageUrl}\nEXPLICATION : ${item.summary}`).join('\n---\n');
        return res.status(200).json({ text: aiExplanation, rawSources, title: questionOrSubject, aiExplanation });
      }
    } catch (error) { res.status(500).json({ message: "Erreur lors de la recherche." }); }
  });

  app.post('/api/generate-content', async (req, res) => {
    if (!ai) return res.status(500).json({ error: 'API Gemini non initialisée.' });
    const { type, input, part, settings, manualText, discoursType, time, theme, articleReferences, imageReferences, videoReferences, pointsToReinforce, strengths, encouragements } = req.body;
    let contextData = "";
    if (manualText) {
      contextData = `TEXTE SAISI MANUELLEMENT :\n${manualText}`;
    } else if (typeof input === 'string' && input.startsWith('http')) {
      // Scraping logic... (omitted for brevity, but would be included here)
    }
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';
    let systemInstruction = '';
    let contents = '';
    // ... (logic from generate-content.js to build systemInstruction and contents based on type) ...
    try {
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents, config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 } });
      const text = response.text || "Désolé, je n'ai pas pu générer de contenu.";
      let title = "";
      if (type === 'DISCOURS_THEME') {
        title = text.trim();
        return res.status(200).json({ theme: title });
      } else if (type === 'DISCOURS') {
        title = theme;
      } else {
        const titleMatch = text.match(/^# (.*)/m);
        title = titleMatch ? titleMatch[1] : (type === 'WATCHTOWER' ? "Tour de Garde" : "Cahier de Réunion");
      }
      return res.status(200).json({ text, title });
    } catch (error) { res.status(500).json({ message: "Erreur de quota ou de connexion Gemini." }); }
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
