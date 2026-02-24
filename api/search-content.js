import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings, confirmMode } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

  const baseSystemInstruction = `Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org. Langue de la réponse : ${settings.language || 'fr'}. Si aucune image n'est trouvée, utilise une URL d'image par défaut de jw.org. Ne renvoie aucun texte supplémentaire en dehors du JSON.`;

  const confirmResponseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Le titre exact de l'article." },
      imageUrl: { type: Type.STRING, description: "URL de l'image miniature associée sur jw.org ou wol.jw.org, finissant par .jpg ou .png." },
      summary: { type: Type.STRING, description: "Un résumé concis de l'article, 2-3 phrases maximum." },
      infos: { type: Type.STRING, description: "Informations pratiques comme 'Étude du week-end du...' ou 'X paragraphes'." },
    },
    required: ['title', 'imageUrl', 'summary', 'infos'],
  };

  const fullSearchResponseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Le titre exact de l'article." },
        link: { type: Type.STRING, description: "URL directe jw.org ou wol.jw.org." },
        summary: { type: Type.STRING, description: "Un résumé concis de l'article, 2-3 phrases maximum." },
        imageUrl: { type: Type.STRING, description: "URL de l'image miniature associée sur jw.org ou wol.jw.org, finissant par .jpg ou .png." },
      },
      required: ['title', 'link', 'summary', 'imageUrl'],
    },
  };

  try {
    const config = {
      systemInstruction: confirmMode 
        ? `MISSION : Identifier précisément l'article le plus pertinent pour la confirmation. ${baseSystemInstruction}. Tu DOIS répondre UNIQUEMENT avec un objet JSON valide correspondant à ce schéma : {"title": "...", "imageUrl": "...", "summary": "...", "infos": "..."}`
        : `MISSION DE RECHERCHE COMPLÈTE : Tu es un assistant JW. Pour chaque recherche, identifie l'article le plus pertinent. ${baseSystemInstruction}. Tu DOIS répondre UNIQUEMENT avec un tableau JSON valide d'objets correspondant à ce schéma : [{"title": "...", "link": "...", "summary": "...", "imageUrl": "..."}]`,
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Recherche sur : ${questionOrSubject}`,
      config,
    });

    let fullText = response.text || "";
    fullText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Check if the response is likely HTML (e.g., an error page) instead of JSON
    if (fullText.trim().startsWith('<')) {
      console.error("AI response was HTML, not JSON:", fullText);
      return res.status(500).json({ message: "Erreur: La réponse de l'IA n'est pas au format JSON. Il pourrait s'agir d'une erreur de service." });
    }

    if (confirmMode) {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(fullText);
      } catch (jsonError) {
        console.error("Failed to parse JSON from AI response in confirmMode:", jsonError);
        return res.status(500).json({ message: "Erreur: la réponse de l'IA n'est pas au format JSON attendu pour la confirmation." });
      }

      return res.status(200).json({ 
        previewTitle: parsedResponse.title || "Article trouvé",
        previewImage: parsedResponse.imageUrl || "https://assets.jw.org/assets/m/jwb-og-image.png",
        previewSummary: parsedResponse.summary || "Prêt pour la génération.",
        previewInfos: parsedResponse.infos || ""
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
