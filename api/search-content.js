
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
    Tu es un assistant JW. Pour chaque recherche, identifie l'article le plus pertinent.
    RÈGLE : Renvoie EXCLUSIVEMENT un tableau JSON d'objets, même s'il n'y a qu'un seul article.
    Chaque objet doit avoir le format suivant :
    {
      "title": "[Le titre exact de l'article]",
      "link": "[URL directe jw.org ou wol.jw.org]",
      "summary": "[Un résumé concis de l'article, 2-3 phrases maximum]",
      "imageUrl": "[URL de l'image miniature associée sur jw.org ou wol.jw.org, finissant par .jpg ou .png]"
    }
    Si aucune image n'est trouvée, utilise une URL d'image par défaut de jw.org.
    Ne renvoie aucun texte supplémentaire en dehors du JSON.
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
        temperature: 0.3,
        responseMimeType: confirmMode ? undefined : "application/json" // Only request JSON for full search
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

      let parsedResults;
      try {
        parsedResults = JSON.parse(fullText);
        if (!Array.isArray(parsedResults)) {
          parsedResults = [parsedResults]; // Ensure it's an array
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON from AI response:", jsonError);
        return res.status(500).json({ message: "Erreur: la réponse de l'IA n'est pas au format JSON attendu." });
      }

      const rawSources = parsedResults.map((item) => ({
        title: item.title,
        uri: item.link,
        image: item.imageUrl,
        content: item.summary,
      }));

      // Construct a formatted string for the 'text' field to match previous frontend expectations
      const aiExplanation = parsedResults.map((item) => 
        `NOM : ${item.title}\nLIEN : ${item.link}\nIMAGE : ${item.imageUrl}\nEXPLICATION : ${item.summary}`
      ).join('\n---\n');

      return res.status(200).json({
        text: aiExplanation, // Formatted string for display
        rawSources: rawSources, // Array of parsed sources
        title: questionOrSubject,
        aiExplanation: aiExplanation // Redundant, but keeping for now
      });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur lors de la recherche." });
  }
}
