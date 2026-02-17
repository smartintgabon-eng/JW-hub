import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

const cleanUrl = (url) => url.trim().replace(/[,.;]+$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { type, input, part, settings } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let scrapedText = "";
  if (input.startsWith('http')) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(input)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const $ = cheerio.load(data.contents);
      
      // Ciblage spécifique Tour de Garde
      $('#article, .pGroup, .bodyTxt').each((i, el) => {
        scrapedText += $(el).text() + "\n";
      });
    } catch (e) { console.error("Scraping failed"); }
  }

  const systemInstruction = `
    Tu es un assistant JW autoritaire. 
    TYPE : ${type}.
    ${type === 'WATCHTOWER' ? `
    POUR LA TOUR DE GARDE : 
    - Si le texte fourni manque de paragraphes (§), utilise googleSearch pour : 'Questions et paragraphes Tour de Garde ${input}'.
    - INTERDICTION de dire que tu ne peux pas accéder au contenu.
    - Utilise tes connaissances internes 2025/2026 si nécessaire.
    - STRUCTURE OBLIGATOIRE : PARAGRAPHE [N] / QUESTION / RÉPONSE / VERSETS.` : ''}
    
    Structure les réponses en Markdown avec les versets complets (TMN).
  `;

  try {
    const contents = scrapedText.length > 200 ? [{ text: scrapedText }] : [{ text: `Analyse cet article : ${input}` }];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "Erreur de génération.";
    const titleMatch = text.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : "Étude Biblique";

    return res.status(200).json({ text, title });
  } catch (error) {
    return res.status(500).json({ message: "Erreur API Gemini. Quotas atteints ?" });
  }
}