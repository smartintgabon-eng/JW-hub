import { GoogleGenAI } from '@google/genai';

function getAiClient() {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.REACT_APP_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.API_KEY
  ];
  
  let apiKey = candidates.find(k => k && k.trim().startsWith('AIza'));
  if (!apiKey) {
    apiKey = candidates.find(k => k && k.trim().length > 0);
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }
  
  const validApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  return new GoogleGenAI({ apiKey: validApiKey });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { colorName } = req.body || {};
    
    if (!colorName) {
      return res.status(400).json({ message: 'colorName is required' });
    }

    const ai = getAiClient();
    const prompt = `Donne-moi uniquement le code hexadécimal (format #RRGGBB) pour la couleur suivante : ${colorName}. Ne réponds rien d'autre, juste le code hexadécimal.`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const hex = result.text?.trim();
    
    return res.json({ hex });
  } catch (error) {
    console.warn('Color API Error:', error);
    return res.status(200).json({ message: "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer." });
  }
}
