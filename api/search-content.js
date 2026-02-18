import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings, confirmMode } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Changed to GEMINI_API_KEY

  const systemInstruction = `
    Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org.
    
    MISSION DE RECHERCHE :
    1. Scan jw.org et wol.jw.org pour : "${questionOrSubject}".
    2. Pour CHAQUE résultat trouvé, tu dois impérativement fournir :
       - Le Titre de la publication.
       - Le LIEN DIRECT (URL) vers la partie concernée sur jw.org ou wol.jw.org.
       - Un résumé pertinent.
    3. Touche toutes les publications récentes (2023-2025) disponibles sur le sujet.
    
    FORMAT DE RÉPONSE :
    ## [Titre de l'article]
    **Lien direct :** [URL]
    **Résumé :** [Ton explication]
  `;

  try {
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
      // Extract title, summary and image for confirmation from the generated text
      // The systemInstruction now forces a specific format, so we parse it here.
      const titleMatch = fullText.match(/^##\s*(.*?)\n/);
      const urlMatch = fullText.match(/\*\*Lien direct : \*\*(.*?)\n/);
      const summaryMatch = fullText.match(/\*\*Résumé : \*\*(.*?)(?:\n|$)/);

      return res.status(200).json({ 
        previewTitle: titleMatch ? titleMatch[1].trim() : (questionOrSubject.length > 50 ? questionOrSubject.substring(0, 47) + "..." : questionOrSubject),
        previewSummary: summaryMatch ? summaryMatch[1].trim() : fullText.substring(0, 150) + "...", // Fallback summary
        previewImage: null // Gemini doesn't directly return image URLs here, requires further logic if needed.
      });
    }

    return res.status(200).json({ 
      text: fullText, 
      title: questionOrSubject,
      aiExplanation: fullText // The full text is the AI explanation
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur de recherche. Quotas probablement atteints ou sites inaccessibles." });
  }
}