import { GoogleGenAI } from '@google/genai';
import * as cheerio from 'cheerio';

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

async function fetchArticleData(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch article, status: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    
    let $;
    try {
      $ = cheerio.load(html);
    } catch (e) {
      console.error("Cheerio load error:", e);
      throw new Error("Failed to parse HTML content");
    }

    const title = $('h1').first().text().trim() || $('title').text().trim();
    const summary = $('meta[name=description]').attr('content') || '';
    let image = $('meta[property="og:image"]').attr('content') || null;
    const firstArticleImage = $('#content img, .article-content img, article img, .main-content img').first().attr('src');
    
    if (firstArticleImage) {
      if (firstArticleImage.startsWith('/')) {
        const urlObj = new URL(url);
        image = `${urlObj.origin}${firstArticleImage}`;
      } else if (firstArticleImage.startsWith('http')) {
        image = firstArticleImage;
      }
    }

    const bodyText = $('#content .article-content, article, .main-content, #article, .pGroup, .document-body').text().replace(/\s\s+/g, ' ').trim();

    if (!bodyText) {
        console.warn("No body text found for URL:", url);
    }

    return { title, summary, image, bodyText };
  } catch (error) {
    console.error('Error fetching or parsing article:', error);
    throw new Error(`Could not retrieve article content: ${error.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { questionOrSubject, settings, confirmMode, contentOptions } = req.body;

  if (!questionOrSubject) {
    return res.status(400).json({ message: 'Question or subject is required.' });
  }

  try {
    const ai = getAiClient();
    let articleUrl = questionOrSubject.trim();

    // Check if the input is already a valid URL
    const isUrl = /^https?:\/\/(www\.)?(wol\.jw\.org|jw\.org)/i.test(articleUrl);

    if (!isUrl) {
      const userLanguage = settings?.language || 'fr';
      const searchPrompt = `Based on the user's question "${questionOrSubject}" in language "${userLanguage}", find the single most relevant article URL from wol.jw.org or jw.org. 
      IMPORTANT: For French searches, look for URLs containing 'lp-f' and 'r30' parameters or content in French. 
      Return ONLY the URL.`;
      
      try {
        const urlResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: searchPrompt,
            config: {
              tools: [{ googleSearch: {} }]
            }
        });
        articleUrl = urlResult.text.trim();
      } catch (aiError) {
        console.error("AI Search Error:", aiError);
        return res.status(500).json({ message: 'AI Search failed', details: aiError.message });
      }
    }

    if (!articleUrl || !articleUrl.startsWith('http')) {
      return res.status(404).json({ message: 'Could not find a relevant article URL.' });
    }

    let articleData = null;
    try {
      articleData = await fetchArticleData(articleUrl);
    } catch (scrapeError) {
      console.warn("Scraping failed, falling back to AI search:", scrapeError);
    }

    if (confirmMode) {
        if (articleData) {
            return res.status(200).json({
                previewTitle: articleData.title,
                previewSummary: articleData.summary,
                previewImage: articleData.image,
                previewInfos: `Source: ${new URL(articleUrl).hostname}`
            });
        } else {
             // Fallback preview if scraping fails
             return res.status(200).json({
                previewTitle: "Article trouvé (Accès limité)",
                previewSummary: "Impossible d'afficher l'aperçu, mais l'IA peut analyser ce lien.",
                previewImage: null,
                previewInfos: `Source: ${new URL(articleUrl).hostname}`
            });
        }
    } else {
      let explanationPrompt;
      let contentInclusionInstructions = "";

      if (contentOptions) {
        if (contentOptions.includeArticles) contentInclusionInstructions += "Include references to other relevant articles from jw.org or wol.jw.org.\n";
        if (contentOptions.includeImages) contentInclusionInstructions += "Describe relevant images or visual aids that could be used.\n";
        if (contentOptions.includeVideos) contentInclusionInstructions += "Suggest relevant videos from jw.org.\n";
        if (contentOptions.includeVerses) contentInclusionInstructions += "Include key Bible verses (NWT).\n";
        if (contentOptions.articleLinks && contentOptions.articleLinks.length > 0) {
            contentInclusionInstructions += `Consider these additional articles: ${contentOptions.articleLinks.join(', ')}\n`;
        }
      }

      if (articleData && articleData.bodyText) {
        explanationPrompt = `Based on the user's question "${questionOrSubject}" and the content of this article, provide a structured explanation.\nArticle Title: ${articleData.title}\nArticle Content: "${articleData.bodyText.substring(0, 15000)}"\nUser Preferences: ${JSON.stringify(settings?.answerPreferences || [])}\n${contentInclusionInstructions}\nFormat the response in Markdown. Include the article title as a heading, the URL as a clickable link [Lien de l'article](${articleUrl}), and then the detailed explanation. Ensure the content is strictly based on the provided text and Jehovah's Witnesses teachings.`;
      } else {
        // Fallback prompt using Google Search tool directly on the URL
        explanationPrompt = `The user wants an analysis of this URL: ${articleUrl}. \nQuestion: "${questionOrSubject}"\nUser Preferences: ${JSON.stringify(settings?.answerPreferences || [])}\n${contentInclusionInstructions}\nUse your Google Search tool to read the content of the URL if possible, or search for information about it. Prioritize content from jw.org or wol.jw.org (especially French content with lp-f/r30 if applicable). Format the response in Markdown. Include the article title as a heading, the URL as a clickable link [Lien de l'article](${articleUrl}), and then the detailed explanation. Ensure the content is strictly based on Jehovah's Witnesses teachings.`;
      }

      const explanationResult = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: explanationPrompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
      });

      return res.status(200).json({ text: explanationResult.text });
    }

  } catch (error) {
    console.error('API Error in search-content:', error);
    res.status(500).json({ message: 'Failed to process search request.', details: error.message });
  }
}
