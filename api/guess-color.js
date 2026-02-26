import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { colorInput, language } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse cette couleur : "${colorInput}". Donne une description poétique et technique (nom de la couleur, ambiance, ce qu'elle évoque). Réponds en ${language === 'fr' ? 'français' : language === 'es' ? 'espagnol' : 'anglais'}. Sois concis (2-3 phrases).`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            hex: { type: Type.STRING }
          },
          required: ["description", "hex"]
        }
      },
    });

    let fullText = response.text || "";
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      fullText = jsonMatch[0];
    }
    
    const parsed = JSON.parse(fullText);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Guess Color Error:", error);
    return res.status(500).json({ message: "Erreur lors de l'analyse de la couleur." });
  }
}
