import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

const cleanUrl = (url) => url.trim().replace(/[,.;]+$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { type, input, part, settings } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let scrapedText = "";
  let scrapingSuccessful = false;

  if (typeof input === 'string' && input.startsWith('http')) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(input)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const $ = cheerio.load(data.contents);
      
      // Ciblage ultra-précis pour la Tour de Garde et articles JW
      $('#article, .pGroup, .bodyTxt, .qu, .marker').each((i, el) => {
        scrapedText += $(el).text() + "\n";
      });
      if (scrapedText.length > 200) scrapingSuccessful = true;
    } catch (e) { 
      console.error("Scraping failed, falling back to pure grounding"); 
    }
  }

  const systemInstruction = `
    Tu es un assistant JW expert et autoritaire. 
    TYPE DE DOCUMENT : ${type}.
    
    INSTRUCTIONS CRITIQUES :
    1. Utilise l'outil googleSearch pour vérifier les informations sur jw.org et wol.jw.org.
    2. Si le texte fourni est fragmenté ou si les paragraphes (§) manquent, utilise tes connaissances internes 2024/2025/2026 pour reconstituer la structure.
    3. INTERDICTION de dire que tu ne peux pas accéder au contenu ou que la recherche est limitée.
    4. DÉDUCTION : Si tu ne trouves pas le texte exact, déduis une réponse spirituelle logique et fidèle basée sur le thème et les principes bibliques des publications des Témoins de Jéhovah.
    5. STRUCTURE OBLIGATOIRE : PARAGRAPHE [N] / QUESTION / RÉPONSE / VERSETS (TMN complets).
    
    STYLE : Moderne, clair et encourageant.
  `;

  try {
    const contents = scrapingSuccessful ? [{ text: `Texte scrapé : ${scrapedText}\n\nAnalyse cet article : ${input}` }] : [{ text: `Analyse et génère les réponses pour : ${input}` }];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      },
    });

    const text = response.text || "Erreur de génération du contenu.";
    const titleMatch = text.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : (typeof input === 'string' && input.startsWith('http') ? "Article JW" : input);

    return res.status(200).json({ text, title });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ message: "Erreur de connexion avec l'IA. Vérifiez vos quotas ou votre clé GEMINI_API_KEY." });
  }
}