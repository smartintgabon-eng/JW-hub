
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings, confirmMode } = req.body;
  /* Fix: Use process.env.API_KEY for GenAI initialization */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

  const systemInstruction = `
    Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org.
    Langue de la réponse : ${settings.language || 'fr'}.
    
    ${confirmMode ? `
    MISSION : Identifier précisément l'article le plus pertinent pour la confirmation.
    RÈGLE : Réponds EXCLUSIVEMENT sous le format suivant :
    TITRE: [Le titre exact de l'article]
    IMAGE: [URL de l'image miniature associée sur jw.org]
    RÉSUMÉ: [Un résumé de 2 lignes maximum]
    INFOS: [Informations pratiques comme "Étude du week-end du..." ou "X paragraphes"]
    ` : `
    MISSION DE RECHERCHE COMPLÈTE :
    Pour chaque source trouvée, tu dois impérativement fournir :
    NOM : [Titre de la publication]
    LIEN : [URL directe jw.org ou wol.jw.org]
    EXPLICATION : [Ton analyse détaillée qui synthétise l'information]
    `}
  `;

  try {
    /* Fix: Use gemini-3-flash-preview for research and summarization tasks */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: [{ text: `Recherche sur : ${questionOrSubject}` }],
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      },
    });

    const fullText = response.text || "";
    
    if (confirmMode) {
      const titleMatch = fullText.match(/TITRE\s*:\s*(.*)/i);
      const imgMatch = fullText.match(/IMAGE\s*:\s*(.*)/i);
      const sumMatch = fullText.match(/RÉSUMÉ\s*:\s*(.*)/i);
      const infosMatch = fullText.match(/INFOS\s*:\s*(.*)/i);

      return res.status(200).json({ 
        previewTitle: titleMatch ? titleMatch[1].trim() : "Article trouvé",
        previewImage: imgMatch ? imgMatch[1].trim() : "https://assets.jw.org/assets/m/jwb-og-image.png",
        previewSummary: sumMatch ? sumMatch[1].trim() : "Prêt pour la génération.",
        previewInfos: infosMatch ? infosMatch[1].trim() : ""
      });
    }

    return res.status(200).json({ 
      text: fullText, 
      title: questionOrSubject,
      aiExplanation: fullText
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur lors de la recherche." });
  }
}
