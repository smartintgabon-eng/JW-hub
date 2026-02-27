import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  const { type, input, settings, manualText } = req.body;
  
  // Utilisation de la variable d'environnement définie dans Vercel
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  
  let contextData = manualText || "";

  // Scraping amélioré avec Proxy pour éviter les blocages de jw.org
  if (!manualText && input?.startsWith('http')) {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
      const data = await response.json();
      const $ = cheerio.load(data.contents);
      $('#article, .pGroup, .bodyTxt, .qu').each((_, el) => {
        contextData += $(el).text() + "\n";
      });
    } catch (e) {
      console.log("Échec du scraping, l'IA utilisera la recherche directe.");
    }
  }

  const systemInstruction = `
    Tu es un assistant expert JW. 
    Ton rôle est d'analyser le contenu fourni pour générer une réponse précise et pertinente en Markdown, en citant les versets en TMN. 
    Si des informations sont fournies comme "TEXTE SOURCE", utilise-les en priorité. Sinon, utilise googleSearch pour trouver des informations sur jw.org. 
    Respecte les préférences utilisateur: ${settings?.aiPreferences || "Aucune"}.
    Si tu ne trouves rien, explique pourquoi clairement.
  `;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: systemInstruction },
        ...(contextData ? [{ text: `TEXTE SOURCE :\n${contextData}` }] : []),
        { text: `QUESTION/SUJET : ${input}` },
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const response = await result.response;
    res.status(200).json({ text: response.text(), title: "Analyse réussie" });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur de génération avec Gemini 2.5 Flash", 
      error: error.message 
    });
  }
}
