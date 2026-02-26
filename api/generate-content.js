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

  const { input, manualText, text, settings, type, part } = req.body;

  const contentToAnalyze = manualText || input || text;

  if (!contentToAnalyze) {
    return res.status(400).json({ message: 'Content for analysis is required.' });
  }

  try {
    const ai = getAiClient();
    let prompt = `Analyze the following content and provide a structured explanation based on user preferences.\nContent: "${contentToAnalyze}"\nUser Preferences: ${JSON.stringify(settings.answerPreferences)}\n`;
    
    if (type === 'WATCHTOWER') {
      prompt += `This is a Watchtower study article. Format the response with a clear title, a summary, and a detailed, point-by-point explanation for each paragraph or section.`;
    } else if (type === 'MINISTRY') {
      prompt += `This is a Ministry Workbook meeting part (${part || 'full'}). Format the response appropriately for this specific part, providing practical points, scriptures, and clear explanations.`;
    } else {
      prompt += `Format the response with a clear title, a summary, and a detailed, point-by-point explanation.`;
    }

    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
    });

    res.status(200).json({ text: result.text, title: "Generated Content" });

  } catch (error) {
    console.error('API Error in generate-content:', error);
    res.status(500).json({ message: 'Failed to generate content.', details: error.message });
  }
}
