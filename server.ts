import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware pour parser le JSON
  app.use(express.json());

  // API Route: Generate Content
  app.post('/api/generate-content', async (req, res) => {
    const { type, input, settings, mode, rawInput } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined');
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = input;
      let scrapedContent = "";

      // 1. Analyse de lien direct (Mode 'link')
      if (mode === 'link' && rawInput && rawInput.startsWith('http')) {
        try {
          console.log(`Scraping URL: ${rawInput}`);
          const response = await fetch(rawInput, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (response.ok) {
            const html = await response.text();
            const $ = cheerio.load(html);
            
            // Nettoyage spécifique jw.org
            $('script, style, nav, footer, header, .advertisement').remove();
            
            // Extraction du contenu principal
            const title = $('h1').first().text().trim();
            const articleBody = $('article, .docSubContent, #article').text().trim();
            
            if (articleBody) {
              scrapedContent = `
                TITRE: ${title}
                CONTENU EXTRAIT DE L'URL (${rawInput}):
                ${articleBody.substring(0, 15000)} // Limite pour éviter surcharge
              `;
              console.log("Contenu scrapé avec succès.");
            }
          }
        } catch (scrapeError) {
          console.error("Erreur de scraping:", scrapeError);
          // Fallback: On laisse Gemini utiliser Google Search si le scraping échoue
        }
      }

      // 2. Construction du prompt final
      let finalPrompt = prompt;
      if (scrapedContent) {
        finalPrompt += `\n\n--- CONTENU DU LIEN FOURNI ---\n${scrapedContent}\n\nUtilise ce contenu comme source principale et unique pour ta réponse.`;
      }

      // 3. Configuration du modèle
      const modelName = settings?.modelName || 'gemini-3.1-pro-preview';
      
      // Outils (Google Search activé si pas de contenu scrapé ou si c'est une recherche thème)
      const tools = [];
      if (!scrapedContent || mode === 'theme' || type === 'RECHERCHES') {
        tools.push({ googleSearch: {} });
      }

      // Configuration du Thinking Mode pour les tâches complexes
      let thinkingConfig = undefined;
      if (modelName.includes('gemini-3') && (type === 'DISCOURS' || type === 'RECHERCHES' || type === 'WATCHTOWER')) {
          thinkingConfig = { thinkingLevel: "HIGH" };
      }

      // 4. Appel à Gemini
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: finalPrompt }]
          }
        ],
        config: {
          tools: tools.length > 0 ? tools : undefined,
          thinkingConfig: thinkingConfig,
          systemInstruction: `Tu es un assistant pour l'étude théocratique des Témoins de Jéhovah.
          Ton but est d'aider à la préparation des réunions et à l'étude personnelle.
          
          Règles :
          1. Base tes réponses UNIQUEMENT sur les doctrines officielles des Témoins de Jéhovah (jw.org).
          2. Cite toujours les versets bibliques (Traduction du Monde Nouveau).
          3. Sois encourageant, respectueux et précis.
          4. Si tu utilises Google Search, privilégie les sources jw.org ou wol.jw.org.
          5. Structure ta réponse avec du Markdown clair (titres, listes, gras).
          
          Préférences utilisateur : ${settings?.answerPreferences?.map((p: any) => p.text).join(', ') || 'Aucune'}`
        }
      });

      const text = response.text;
      
      // Extraction des sources (Grounding)
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      let sources: string[] = [];
      if (groundingMetadata?.groundingChunks) {
        sources = groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web?.uri)
          .filter((url: string) => url);
      }

      res.status(200).json({ 
        text: text,
        sources: sources
      });

    } catch (error: any) {
      console.error('Erreur API:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la génération', 
        details: error.message 
      });
    }
  });

  // Vite middleware for development (MUST be last)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
