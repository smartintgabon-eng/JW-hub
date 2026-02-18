import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings, confirmMode } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Changed to GEMINI_API_KEY

  const systemInstruction = `
    Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org.
    
    STRICTE DISCIPLINE :
    1. Scan en priorité : https://www.jw.org/fr/rechercher/?q=
    2. Si pas de réponse directe, cherche sur WOL (Bibliothèque en ligne).
    3. INTERDICTION d'utiliser des connaissances générales si elles ne sont pas validées par ces sites.
    4. DÉDUCTION : Si tu trouves des fragments, construis une réponse basée uniquement sur les principes bibliques JW.
    
    ${confirmMode ? `
    MODE CONFIRMATION :
    - Présente UNIQUEMENT : 
      1. Le Titre de l'article trouvé le plus pertinent.
      2. Une brève idée générale (2 lignes).
      3. Une URL d'image de l'article si disponible sur jw.org.
    ` : `
    MODE GÉNÉRATION :
    - Fournis d'abord le texte brut intégral des sources.
    - Ensuite, ton explication détaillée.
    - Enfin, tous les liens URL utilisés.
    `}
  `;

  try {
    // Use gemini-2.5-flash for advanced reasoning and research tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Changed to gemini-2.5-flash
      contents: [{ text: `Recherche approfondie sur : ${questionOrSubject}` }],
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      },
    });

    const fullText = response.text || "";
    
    if (confirmMode) {
      // Extract title and summary for confirmation
      const lines = fullText.split('\n').filter(l => l.trim() !== "");
      return res.status(200).json({ 
        previewTitle: lines[0]?.replace(/^#*\s*/, '') || "Article trouvé",
        previewSummary: lines.slice(1, 4).join(' '),
        previewImage: fullText.match(/https?:\/\/\S+\.(?:jpg|png|gif)/i)?.[0] || null
      });
    }

    return res.status(200).json({ 
      text: fullText, 
      title: questionOrSubject,
      aiExplanation: fullText
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur de recherche. Quotas probablement atteints ou sites inaccessibles." });
  }
}