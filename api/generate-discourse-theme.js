import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { criteria, language } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'Gemini API key not configured.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let prompt = `Génère un thème de discours pour une durée de ${criteria.time}.`;
    if (criteria.themeCriteria) {
      prompt += ` Les critères supplémentaires sont : ${criteria.themeCriteria}.`;
    } else {
      prompt += ` Le thème doit être inspirant et adapté à un public général.`;
    }
    prompt += ` Réponds uniquement avec le thème, sans introduction ni conclusion.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
    });
    const theme = result.text.trim();

    res.status(200).json({ theme });
  } catch (error) {
    console.error('Error generating discourse theme:', error);
    res.status(500).json({ message: 'Error generating discourse theme', error: error.message });
  }
}
