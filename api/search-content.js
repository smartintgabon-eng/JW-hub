import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Forbidden');

  const { questionOrSubject, confirmMode } = req.body;
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const prompt = confirmMode 
    ? `Trouve l'article JW le plus pertinent pour "${questionOrSubject}". Réponds uniquement avec ce format:
       TITRE: (nom de l'article)
       RESUME: (2 lignes)
       IMAGE: (url d'image jw.org si possible)`
    : `Fais une recherche complète sur "${questionOrSubject}" sur jw.org. Donne les liens clairs.`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const text = result.response.text();

    if (confirmMode) {
      // Extraction sécurisée pour éviter les erreurs d'affichage
      const title = text.match(/TITRE:\s*(.*)/i)?.[1] || questionOrSubject;
      const summary = text.match(/RESUME:\s*(.*)/i)?.[1] || "Cliquez pour voir les détails.";
      const image = text.match(/https?:\/\/\S+\.(?:jpg|jpeg|png)/i)?.[0] || null;

      return res.status(200).json({
        previewTitle: title,
        previewSummary: summary,
        previewImage: image
      });
    }

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "Recherche impossible pour le moment." });
  }
}