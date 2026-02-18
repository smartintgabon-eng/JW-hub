import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings, confirmMode } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Changed to GEMINI_API_KEY

  const systemInstruction = `
    Tu es un assistant expert JW. 
    STRICTE DISCIPLINE : N'utilise que jw.org et wol.jw.org. Ne déduis qu'à partir de ces sources.

    ${confirmMode ? `
    MODE APERÇU :
    Trouve l'article le plus pertinent sur jw.org ou wol.jw.org pour : "${questionOrSubject}".
    Réponds EXCLUSIVEMENT sous ce format (ne réponds rien d'autre) :
    TITRE : [Le titre exact de l'article trouvé]
    IMAGE : https://www.jw.org/fr/biblioth%C3%A8que/livres/%C3%89tude-perspicace-des-%C3%89critures/Exemples-images/ (Utilise cette URL générique si tu ne trouves pas d'image spécifique pertinente)
    RÉSUMÉ : [Un résumé concis et pertinent de 2-3 lignes du contenu de l'article]
    ` : `
    MODE RECHERCHE COMPLÈTE :
    Recherche en profondeur sur jw.org et wol.jw.org pour : "${questionOrSubject}".
    Pour CHAQUE source pertinente trouvée, tu dois impérativement fournir les informations suivantes. Si plusieurs sources sont trouvées, répète ce format pour chacune.
    
    FORMAT DE RÉPONSE POUR L'ONGLET RECHERCHE :
    NOM : [Titre de la publication trouvé]
    LIEN : [URL directe de la page ou section concernée sur jw.org ou wol.jw.org]
    EXPLICATION : [Ton analyse détaillée qui synthétise les informations clés de cette source par rapport à la question, environ 5-7 lignes.]
    `}
    REMARQUE : Garde le style bienveillant et professionnel.
  `;

  try {
    const contents = [{ text: `Recherche sur : ${questionOrSubject}` }];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Maintaining gemini-2.5-flash for consistency and stability
      contents,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      },
    });

    const fullText = response.text || "";
    
    if (confirmMode) {
      // Parse the exact format specified for confirmMode
      const titleMatch = fullText.match(/TITRE\s*:\s*(.*)/i);
      const imgMatch = fullText.match(/IMAGE\s*:\s*(.*)/i);
      const sumMatch = fullText.match(/RÉSUMÉ\s*:\s*(.*)/i);

      return res.status(200).json({ 
        previewTitle: titleMatch ? titleMatch[1].trim() : "Article trouvé",
        previewImage: imgMatch ? imgMatch[1].trim() : "https://assets.jw.org/assets/m/jwb-og-image.png", // Fallback image provided by user
        previewSummary: sumMatch ? sumMatch[1].trim() : "Cliquez pour générer l'analyse."
      });
    }

    return res.status(200).json({ 
      text: fullText, // Full text will contain structured NOM, LIEN, EXPLICATION blocks
      title: questionOrSubject,
      aiExplanation: fullText // The full text is the AI explanation, structured for parsing
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur de recherche. Quotas probablement atteints ou sites inaccessibles." });
  }
}