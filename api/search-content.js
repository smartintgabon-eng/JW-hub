import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { questionOrSubject } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });

    // 1. Scraping si c'est une URL
    let context = "";
    if (questionOrSubject.startsWith('http')) {
      const response = await fetch(questionOrSubject);
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer').remove();
      context = $("body").text().substring(0, 5000);
    }

    // 2. IA avec Grounding
    const prompt = `Tu es un assistant expert pour les Témoins de Jéhovah. 
    Sujet: ${questionOrSubject}
    ${context ? `Contenu de la page : ${context}` : ""}
    
    Instructions: 
    - Si l'utilisateur dit "raconte", fais un récit vivant. 
    - Si l'utilisateur dit "explique", sois profond et pédagogique.
    - Cite toujours des versets bibliques.
    - Donne des liens vers jw.org.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = result.text;

    res.status(200).json({
      text,
      previewTitle: questionOrSubject.substring(0, 50),
      previewSummary: text.substring(0, 150) + "...",
      previewInfos: "Source: Recherche Intelligente JW"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
