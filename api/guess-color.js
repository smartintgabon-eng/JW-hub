import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { colorInput, language } = req.body;

  if (!colorInput) {
    return res.status(400).json({ message: 'Color input is required.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Tu es un expert en couleurs. Ton rôle est d'analyser une entrée de couleur (nom ou code hexadécimal) et de fournir une description concise et pertinente de cette couleur. Si l'entrée est un nom de couleur, décris la couleur. Si c'est un code hexadécimal, identifie la couleur et décris-la. Si l'entrée est ambiguë ou invalide, indique-le.
    Langue de la réponse : ${language || 'fr'}.
    Format de la réponse : Une phrase descriptive courte, sans introduction ni conclusion.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ text: `Analyse la couleur : ${colorInput}` }],
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text || "Désolé, je n'ai pas pu analyser cette couleur.";
    return res.status(200).json({ description: text });
  } catch (error) {
    console.error("Gemini Color Guessing Error:", error);
    return res.status(500).json({ message: "Erreur de quota ou de connexion Gemini pour l'analyse de couleur. Réessayez dans quelques instants." });
  }
}
