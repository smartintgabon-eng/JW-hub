
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
    Tu es un expert JW. Pour chaque recherche :
    1. Trouve l'image de couverture (URL finissant par .jpg ou .png).
    2. Format de réponse STRICT pour l'affichage :
       # [TITRE DE LA PUBLICATION]
       Lien : [URL directe jw.org ou wol.jw.org]
       Image : [URL de l'image miniature associée sur jw.org]
       ---
       Résumé : [Ton explication détaillée]
    `
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

      const results = [];
      const entries = fullText.split('---').filter(entry => entry.trim() !== ''); // Split by the separator
      for (const entry of entries) {
        const titleMatch = entry.match(/#\s*\[(.*?)\]/);
        const linkMatch = entry.match(/Lien\s*:\s*(.*)/);
        const imageMatch = entry.match(/Image\s*:\s*(.*)/);
        const summaryMatch = entry.match(/Résumé\s*:\s*(.*)/);

        if (titleMatch && linkMatch && imageMatch && summaryMatch) {
          results.push({
            title: titleMatch[1].trim(),
            uri: linkMatch[1].trim(),
            image: imageMatch[1].trim(),
            content: summaryMatch[1].trim(), // Using content for summary in rawSources
          });
        }
      }

      const aiExplanation = fullText; // The overall explanation can be the fullText

      return res.status(200).json({
        text: aiExplanation, // This will be the full markdown text
        rawSources: results, // Array of parsed sources
        title: questionOrSubject, // Original question as title
        aiExplanation: aiExplanation // Redundant, but keeping for now
      });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur lors de la recherche." });
  }
}
