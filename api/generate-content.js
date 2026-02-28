import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { type, input, part, settings, manualText } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let contextText = manualText || "";
    let sources = [];

    // If no manual text, we need to scrape the input URLs or search
    if (!manualText && input) {
      const inputs = input.split('\n').map(s => s.trim()).filter(Boolean);
      
      for (const item of inputs) {
        try {
          new URL(item);
          // It's a URL, scrape it
          const response = await fetch(item);
          const html = await response.text();
          const $ = cheerio.load(html);
          $('script, style, nav, footer, header, iframe, noscript').remove();
          contextText += `\n\nSource (${item}):\n` + $('body').text().replace(/\s+/g, ' ').trim();
        } catch (e) {
          // Not a URL, use it as a search query with Google Search Grounding
          const searchResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search for detailed information about: "${item}"`,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });
          contextText += `\n\nSearch Results for "${item}":\n` + searchResponse.text;
          
          const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) {
            const uris = chunks.map(chunk => chunk.web?.uri).filter(Boolean);
            sources.push(...uris);
          }
        }
      }
    }

    // Now generate the final content based on the context
    let prompt = `You are a helpful assistant. Based on the following context, generate a study guide or summary for the part: "${part}".\n\nContext:\n${contextText.substring(0, 30000)}`;
    
    if (type === 'WATCHTOWER') {
      prompt = `You are a helpful assistant for Watchtower study preparation. Based on the following article text, generate a comprehensive study guide. Include key points, scriptures, and practical applications.\n\nArticle Text:\n${contextText.substring(0, 30000)}`;
    } else if (type === 'MINISTRY') {
      prompt = `You are a helpful assistant for the Christian Life and Ministry meeting preparation. Based on the following text, generate preparation material for the part: "${part}". Include key points, scriptures, and practical applications.\n\nText:\n${contextText.substring(0, 30000)}`;
    }

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let generatedText = aiResponse.text;
    
    if (sources.length > 0) {
      const uniqueSources = [...new Set(sources)];
      generatedText += `\n\n### Sources\n` + uniqueSources.map(s => `- ${s}`).join('\n');
    }

    // Extract a title from the generated text
    const titleMatch = generatedText.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : (type === 'WATCHTOWER' ? 'Watchtower Study' : 'Ministry Preparation');

    return res.status(200).json({
      title: title,
      text: generatedText
    });

  } catch (error) {
    console.error('Generate API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}