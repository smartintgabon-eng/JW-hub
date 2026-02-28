import { GoogleGenAI, Type } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { questionOrSubject, settings, confirmMode } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let isUrl = false;
    try {
      new URL(questionOrSubject);
      isUrl = true;
    } catch (e) {
      isUrl = false;
    }

    let scrapedData = {
      title: '',
      summary: '',
      image: '',
      text: ''
    };

    if (isUrl) {
      // Scraping with Cheerio
      const response = await fetch(questionOrSubject);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      scrapedData.title = $('title').text() || $('h1').first().text();
      scrapedData.summary = $('meta[name="description"]').attr('content') || $('p').first().text();
      scrapedData.image = $('meta[property="og:image"]').attr('content') || '';
      
      // Clean up unnecessary elements
      $('script, style, nav, footer, header, iframe, noscript').remove();
      scrapedData.text = $('body').text().replace(/\s+/g, ' ').trim();
      
      // Use Gemini to format the preview
      const prompt = `Based on the following scraped web page content, provide a JSON preview with a title, a short summary (max 2 sentences), and key infos (like author, date, or main topic).
         Title: ${scrapedData.title}
         Summary: ${scrapedData.summary}
         Content: ${scrapedData.text.substring(0, 5000)}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              previewTitle: { type: Type.STRING },
              previewSummary: { type: Type.STRING },
              previewInfos: { type: Type.STRING }
            },
            required: ["previewTitle", "previewSummary", "previewInfos"]
          }
        }
      });

      const result = JSON.parse(aiResponse.text);
      return res.status(200).json({
        previewTitle: result.previewTitle || scrapedData.title,
        previewSummary: result.previewSummary || scrapedData.summary,
        previewImage: scrapedData.image || null,
        previewInfos: result.previewInfos || '',
        text: scrapedData.text
      });

    } else {
      // Not a URL -> Use Gemini with Google Search Grounding
      const prompt = `Search for information about: "${questionOrSubject}". Provide a comprehensive summary of the topic.`;
      
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Extract URLs from grounding metadata
      const chunks = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let sources = [];
      if (chunks) {
        sources = chunks.map(chunk => chunk.web?.uri).filter(Boolean);
      }

      const text = aiResponse.text;
      
      // Generate a quick preview from the text
      const previewPrompt = `Extract a title, a short summary (max 2 sentences), and key infos from this text: ${text.substring(0, 2000)}`;
      const previewResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: previewPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              previewTitle: { type: Type.STRING },
              previewSummary: { type: Type.STRING },
              previewInfos: { type: Type.STRING }
            },
            required: ["previewTitle", "previewSummary", "previewInfos"]
          }
        }
      });
      
      const result = JSON.parse(previewResponse.text);

      return res.status(200).json({
        previewTitle: result.previewTitle || questionOrSubject,
        previewSummary: result.previewSummary || text.substring(0, 100) + '...',
        previewImage: null,
        previewInfos: result.previewInfos || (sources.length > 0 ? `Sources: ${sources.length}` : ''),
        text: text,
        sources: sources
      });
    }

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}