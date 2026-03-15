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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { colorName } = await req.json();
    
    if (!colorName) {
      return new Response(JSON.stringify({ message: 'colorName is required' }), { status: 400 });
    }

    const ai = getAiClient();
    const prompt = `Donne-moi uniquement le code hexadécimal (format #RRGGBB) pour la couleur suivante : ${colorName}. Ne réponds rien d'autre, juste le code hexadécimal.`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    const hex = result.text?.trim();
    
    return new Response(JSON.stringify({ hex }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Color API Error:', error);
    return new Response(JSON.stringify({ message: "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer." }), { status: 200 });
  }
}
