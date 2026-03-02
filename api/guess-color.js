import { GoogleGenAI } from '@google/genai';

let aiClient;
function getAiClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text for color analysis is required.' });
  }

  try {
    const ai = getAiClient();
    const prompt = `Based on the dominant theme of the following text, suggest a single primary hex color code that would be appropriate for a button or accent color. The text is: "${text.substring(0, 1000)}". Return ONLY the hex code as a JSON object like this: {"hex": "#RRGGBB"}.`;

    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
    });

    // The response from the AI should be a JSON string like '{"hex":"#RRGGBB"}'
    // We parse it to get the actual object.
    const colorData = JSON.parse(result.text);

    res.status(200).json(colorData);

  } catch (error) {
    console.error('API Error in guess-color:', error);
    res.status(500).json({ message: 'Failed to guess color.', details: error.message });
  }
}
