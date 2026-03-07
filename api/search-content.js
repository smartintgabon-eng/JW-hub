import { GoogleGenAI } from '@google/genai';
import * as cheerio from 'cheerio';
import { kv } from '@vercel/kv';

let aiClient;
function getAiClient() {
  if (!aiClient) {
    const candidates = [
      process.env.GEMINI_API_KEY,
      process.env.VITE_GEMINI_API_KEY,
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
  if (!url || !url.startsWith('http')) return null;
  
  // Try to get from cache first
  try {
    const cached = await kv.get(`article:${url}`);
    if (cached) {
      console.log(`Cache hit for article: ${url}`);
      return cached;
    }
  } catch (e) {
    console.warn("KV Cache read error:", e);
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.google.com/'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch article, status: ${response.status} ${response.statusText} for ${url}`);
        return null;
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
      
      // Try to find a better image in the content
      const firstArticleImage = $('#content img, .article-content img, article img, .main-content img, .publication-image img').first().attr('src');
      
      if (firstArticleImage) {
        if (firstArticleImage.startsWith('/')) {
          const urlObj = new URL(url);
          image = `${urlObj.origin}${firstArticleImage}`;
        } else if (firstArticleImage.startsWith('http')) {
          image = firstArticleImage;
        }
      } else if (image && image.startsWith('/')) {
          const urlObj = new URL(url);
          image = `${urlObj.origin}${image}`;
      }

      if (!image) {
        image = "https://assets.jw.org/assets/m/jwb/jwb_placeholder.png";
      }

      // Extract theme verse if available (often in .themeVerse or similar)
      const themeVerse = $('.themeVerse, .theme-verse, .scrp, .bible-verse').first().text().trim() || '';

      // Limit body text to 5000 characters for "Fast" mode
      const bodyText = $('#content .article-content, article, .main-content, #article, .pGroup, .document-body, .articleText').text().replace(/\s\s+/g, ' ').trim().substring(0, 5000);

      const articleData = { title, summary, image, bodyText, themeVerse, url };
      
      // Store in cache for 24 hours
      try {
        await kv.set(`article:${url}`, articleData, { ex: 86400 });
      } catch (e) {
        console.warn("KV Cache write error:", e);
      }

      return articleData;
    } catch (error) {
      attempt++;
      console.warn(`Fetch attempt ${attempt} failed for ${url}:`, error.message);
      if (attempt >= maxRetries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function searchJW(query, language = 'fr') {
  const searchUrl = `https://www.jw.org/${language}/rechercher/?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
    });
    if (!response.ok) return [];
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.resultTitle a').each((i, el) => {
      if (i < 3) {
        let href = $(el).attr('href');
        if (href && href.startsWith('/')) href = `https://www.jw.org${href}`;
        results.push(href);
      }
    });
    return results;
  } catch (e) {
    console.error("JW Search error:", e);
    return [];
  }
}

async function searchWOL(query, language = 'fr') {
  const langCode = language === 'fr' ? 'lp-f' : language === 'es' ? 'lp-s' : 'lp-e';
  const rCode = language === 'fr' ? 'r30' : language === 'es' ? 'r132' : 'r1';
  const searchUrl = `https://wol.jw.org/${language}/wol/s/${rCode}/${langCode}?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
    });
    if (!response.ok) return [];
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.resultTitle a').each((i, el) => {
      if (i < 3) {
        let href = $(el).attr('href');
        if (href && href.startsWith('/')) href = `https://wol.jw.org${href}`;
        results.push(href);
      }
    });
    return results;
  } catch (e) {
    console.error("WOL Search error:", e);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { questionOrSubject, settings, confirmMode, contentOptions, part } = req.body;

  if (!questionOrSubject && !confirmMode) {
    return res.status(400).json({ message: 'Question or subject is required.' });
  }

  try {
    const ai = getAiClient();
    const userLanguage = settings?.language || 'fr';
    let articleUrl = questionOrSubject.trim();

    // Intent Analysis
    const lowerQuery = questionOrSubject.toLowerCase();
    const isTellIntent = lowerQuery.includes('raconte') || lowerQuery.includes('histoire') || lowerQuery.includes('tell');

    // Check if the input is already a valid URL
    const isUrl = /^https?:\/\/(www\.)?(wol\.jw\.org|jw\.org)/i.test(articleUrl);

    if (!isUrl) {
      // Perform real search on JW and WOL
      const jwResults = await searchJW(questionOrSubject, userLanguage);
      const wolResults = await searchWOL(questionOrSubject, userLanguage);
      const allResults = [...jwResults, ...wolResults];
      
      if (allResults.length > 0) {
        articleUrl = allResults[0]; // Take the first most relevant result
      } else {
        // Fallback to AI search if direct scraping search fails
        const searchPrompt = `Based on the user's question "${questionOrSubject}" in language "${userLanguage}", find the single most relevant article URL from wol.jw.org or jw.org. 
        IMPORTANT: For French searches, look for URLs containing 'lp-f' and 'r30' parameters or content in French. 
        Return ONLY the URL.`;
        
        const urlResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: searchPrompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        articleUrl = urlResult.text.trim();
      }
    }

    if (!articleUrl || !articleUrl.startsWith('http')) {
      return res.status(404).json({ message: 'Could not find a relevant article URL.' });
    }

    // Fetch main article data
    const articleData = await fetchArticleData(articleUrl);
    if (!articleData) {
      return res.status(500).json({ message: "Failed to fetch article content." });
    }

    if (confirmMode) {
      return res.status(200).json({
        previewTitle: articleData.title || "Article trouvé",
        previewSummary: articleData.summary || "Aperçu non disponible.",
        previewImage: articleData.image || "https://assets.jw.org/assets/m/jwb/jwb_placeholder.png",
        previewInfos: articleData.themeVerse ? `Verset Thème: ${articleData.themeVerse}` : `Source: ${new URL(articleUrl).hostname}`,
        url: articleUrl
      });
    }

    // Full Generation Mode
    let contentInclusionInstructions = "";
    if (contentOptions) {
      if (contentOptions.includeArticles) contentInclusionInstructions += "Include references to other relevant articles from jw.org or wol.jw.org.\n";
      if (contentOptions.includeImages) contentInclusionInstructions += "Describe relevant images or visual aids that could be used.\n";
      if (contentOptions.includeVideos) contentInclusionInstructions += "Suggest relevant videos from jw.org.\n";
      contentInclusionInstructions += "Include key Bible verses (NWT) - this is MANDATORY.\n";
    }

    // If "Tell" intent, try to find Bible text first
    let bibleText = "";
    if (isTellIntent) {
      const bibleSearch = await searchJW(`Bible ${questionOrSubject}`, userLanguage);
      if (bibleSearch.length > 0) {
        const bibleData = await fetchArticleData(bibleSearch[0]);
        if (bibleData) bibleText = bibleData.bodyText;
      }
    }

    const explanationPrompt = `
    Question de l'utilisateur : "${questionOrSubject}"
    Article Principal : ${articleData.title} (${articleUrl})
    Contenu de l'article : "${articleData.bodyText}"
    ${bibleText ? `Texte Biblique : "${bibleText.substring(0, 3000)}"` : ""}
    ${part && part !== 'tout' ? `SECTION SPÉCIFIQUE À GÉNÉRER : ${part.replace(/_/g, ' ')}` : ""}
    
    INSTRUCTIONS DE RÉPONSE :
    ${contentInclusionInstructions}
    ${part && part !== 'tout' ? `CONCENTRE-TOI UNIQUEMENT sur la section "${part.replace(/_/g, ' ')}" de l'étude.` : ""}
    1. TEXTE DE L'ARTICLE : Présente le texte brut extrait de l'article (ou un résumé fidèle si trop long).
    2. TEXTE BIBLIQUE : Affiche le texte biblique complet concerné (verset ou chapitre).
    3. EXPLICATION : Fournis une explication pédagogique détaillée, fidèle aux enseignements des Témoins de Jéhovah.
    4. ANALYSE : ${isTellIntent ? "Détaille les aspects historiques et prophétiques du récit." : "Clarifie le sujet en utilisant les publications les plus récentes."}
    5. SOURCES (MANDATOIRE) : À la fin, liste impérativement les liens directs vers :
       - Les articles cités (jw.org / wol.jw.org)
       - Les vidéos suggérées (jw.org)
       - Les images sources
    
    Formatte la réponse en Markdown. Utilise des titres clairs.
    Lien de l'article source : [${articleData.title}](${articleUrl})`;

    // Use streaming for full generation to avoid Vercel timeout
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: explanationPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();
    return;

  } catch (error) {
    console.error('API Error in search-content:', error);
    
    // Check for API key expiration
    if (error.message && (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID'))) {
      return res.status(500).json({ 
        message: 'Your Gemini API Key has expired or is invalid. Please update GEMINI_API_KEY in your environment variables.', 
        details: error.message 
      });
    }

    res.status(500).json({ message: 'Failed to process search request.', details: error.message });
  }
}
