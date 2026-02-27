import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const { type, input, settings, manualText } = req.body;
  
  // Utilisation de la clé API Vercel
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  let scrapedText = manualText || "";

  // Tentative de récupération du texte sur jw.org
  if (!manualText && input?.includes('jw.org')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec max
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`, { signal: controller.signal });
      const data = await response.json();
      const $ = cheerio.load(data.contents);
      $('#article, .pGroup, .bodyTxt').each((_, el) => { scrapedText += $(el).text() + "\n"; });
      clearTimeout(timeoutId);
    } catch (e) { console.error("Scraping ignoré, passage au grounding"); }
  }

  const prompt = `
    Rôle: Expert JW. 
    Tâche: Étude pour ${type}. 
    Source: ${scrapedText || "Recherche sur jw.org pour " + input}.
    Instructions: Génère les réponses en français, cite les versets TMN. 
    Format: Markdown.
    Préférences: ${settings?.aiPreferences || "Aucune"}.
  `;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", // Plus stable pour les fonctions API actuellement
      contents: [
        { text: prompt },
        ...(scrapedText ? [{ text: `TEXTE SCRAPÉ :\n${scrapedText}` }] : []),
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ text, title: "Analyse terminée" });
  } catch (error) {
    res.status(500).json({ error: "L'IA ne répond pas. Vérifie ta clé API dans Vercel." });
  }
}