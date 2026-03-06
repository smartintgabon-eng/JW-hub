import { GoogleGenAI } from '@google/genai';

let aiClient;
function getAiClient() {
  if (!aiClient) {
    const candidates = [
      process.env.GEMINI_API_KEY,
      process.env.REACT_APP_GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY,
      process.env.API_KEY
    ];
    
    // Prioritize keys that start with "AIza" (standard Google API key format)
    let apiKey = candidates.find(k => k && k.trim().startsWith('AIza'));
    
    // Fallback to the first non-empty key if no "AIza" key is found
    if (!apiKey) {
      apiKey = candidates.find(k => k && k.trim().length > 0);
    }

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
    }
    
    // Trim the key to remove any accidental whitespace and quotes
    const validApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    if (!validApiKey) {
      throw new Error("GEMINI_API_KEY is empty.");
    }
    aiClient = new GoogleGenAI({ apiKey: validApiKey });
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
    // Simplified prompt to just convert color name/description to hex
    const prompt = `Convert the following color name or description into a single valid HEX color code.
    Input: "${text.substring(0, 100)}"
    
    Instructions:
    1. If the input is a standard color name (e.g., "rouge", "bleu marine", "olive green", "vert forêt"), return the most accurate hex code for that color.
    2. If the input is a poetic or descriptive name (e.g., "coucher de soleil chaud", "brise matinale", "midnight sky"), return a hex code that best represents that mood.
    3. If the input is already a hex code (e.g., "#ff0000" or "ff0000"), return it validated with the # prefix.
    4. If the input is in another language, translate it mentally and provide the hex.
    
    Return ONLY a JSON object with the key "hex". Example: {"hex": "#000080"}`;

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
    
    // Check for API key expiration
    if (error.message && (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID'))) {
      return res.status(500).json({ 
        message: 'Your Gemini API Key has expired or is invalid. Please update GEMINI_API_KEY in your environment variables.', 
        details: error.message 
      });
    }

    res.status(500).json({ message: 'Failed to guess color.', details: error.message });
  }
}
