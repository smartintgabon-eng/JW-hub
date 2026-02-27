import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  const { questionOrSubject, confirmMode } = req.body;
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const prompt = `
    Effectue une recherche sur jw.org concernant : "${questionOrSubject}".
    ${confirmMode ? 
      "Réponds uniquement en JSON avec ce format : {\"previewTitle\": \"Titre\", \"previewSummary\": \"Résumé 2 lignes\", \"previewImage\": \"Lien image .jpg\"}" : 
      "Affiche chaque source ainsi : \n# [TITRE SUR UNE LIGNE]\nLien : https://www.excellersacademy.com/blog/comment-renvoyer-du-texte-dans-une-cellule-excel\nRésumé : [Explication]\n\nEt termine par une explication générale."
    }
  `;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const text = result.response.text();

    if (confirmMode) {
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return res.status(200).send(cleanJson);
    }

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ message: "La recherche hybride a échoué.", error: error.message });
  }
}
