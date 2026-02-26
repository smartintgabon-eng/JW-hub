import { GoogleGenAI } from '@google/genai';
import cheerio from 'cheerio';

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

async function fetchArticleData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch article, status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const summary = $('meta[name=description]').attr('content') || '';
    let image = $('meta[property="og:image"]').attr('content') || null;
    const firstArticleImage = $('#content img, .article-content img, article img').first().attr('src');
    
    if (firstArticleImage) {
      if (firstArticleImage.startsWith('/')) {
        const urlObj = new URL(url);
        image = `${urlObj.origin}${firstArticleImage}`;
      } else if (firstArticleImage.startsWith('http')) {
        image = firstArticleImage;
      }
    }

    const bodyText = $('#content .article-content').text().replace(/\s\s+/g, ' ').trim();

    return { title, summary, image, bodyText };
  } catch (error) {
    console.error('Error fetching or parsing article:', error);
    throw new Error('Could not retrieve article content.');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { questionOrSubject, settings, confirmMode } = req.body;

  if (!questionOrSubject) {
    return res.status(400).json({ message: 'Question or subject is required.' });
  }

  try {
    const ai = getAiClient();
    const searchPrompt = `Based on the user's question "${questionOrSubject}" in language "${settings.language}", find the single most relevant article URL from wol.jw.org or jw.org. Return ONLY the URL.`;
    
    const urlResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
    });
    
    const articleUrl = urlResult.text.trim();

    if (!articleUrl.startsWith('http')) {
      return res.status(404).json({ message: 'Could not find a relevant article URL.' });
    }

    const { title, summary, image, bodyText } = await fetchArticleData(articleUrl);

    if (confirmMode) {
        return res.status(200).json({
            previewTitle: title,
            previewSummary: summary,
            previewImage: image,
            previewInfos: `Source: ${new URL(articleUrl).hostname}`
        });
    } else {
      const explanationPrompt = `Based on the user's question "${questionOrSubject}" and the content of this article, provide a structured explanation.\nArticle Title: ${title}\nArticle Content: "${bodyText.substring(0, 8000)}"\nUser Preferences: ${JSON.stringify(settings.answerPreferences)}\nFormat the response as a single block of text containing the article title (NOM), the URL (LIEN), and the detailed explanation (EXPLICATION).`;

      const explanationResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: explanationPrompt
      });

      return res.status(200).json({ text: explanationResult.text });
    }

  } catch (error) {
    console.error('API Error in search-content:', error);
    res.status(500).json({ message: 'Failed to process search request.', details: error.message });
  }
}
