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

async function scrapeUrl(url) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.google.com/'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
         // If 404 or 403, maybe retrying won't help, but for 5xx it might.
         // For now, we just return null if not ok to avoid infinite loops on bad URLs.
         console.warn(`Scrape failed with status ${response.status} for ${url}`);
         return null; 
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove scripts, styles, and other non-content elements
      $('script, style, nav, footer, header, aside, .navigation, .site-header, .site-footer, .advertisement, .share-options').remove();
      
      // Extract main content
      // Prioritize specific selectors for jw.org/wol.jw.org
      const content = $('article, main, .docTitle, .docSubTitle, .bodyTxt, .pGroup, #article').text() || $('body').text();
      
      return content.replace(/\s+/g, ' ').trim().substring(0, 20000); // Increased limit slightly
    } catch (error) {
      attempt++;
      console.warn(`Scraping attempt ${attempt} failed for ${url}:`, error.message);
      if (attempt >= maxRetries) {
        console.error('Max scraping retries reached.');
        return null;
      }
      // Wait a bit before retrying (e.g., 1s)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { input, manualText, text, settings, type, part, discoursType, time, theme, articleReferences, pointsToReinforce, strengths, encouragements, contentOptions, preachingType } = req.body;

  try {
    const ai = getAiClient();
    let prompt = '';
    const userLanguage = settings?.language || 'fr';
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

    // Helper to generate content inclusion instructions
    const getContentInclusionInstructions = (options, refs) => {
      let instructions = "";
      if (options) {
        if (options.includeArticles) instructions += `\n- Utilise Google Search pour trouver et inclure des références précises à des articles de jw.org ou wol.jw.org. Pour le français, privilégie les résultats avec les paramètres 'lp-f' et 'r30'. Formatte-les comme des liens Markdown cliquables [Titre](URL).`;
        if (options.includeImages) instructions += `\n- Suggère des images ou illustrations visuelles pertinentes basées sur les publications.`;
        if (options.includeVideos) instructions += `\n- Suggère des vidéos pertinentes de jw.org.`;
        if (options.includeVerses) instructions += `\n- Inclus de nombreux versets bibliques clés avec leur explication, en utilisant la Traduction du monde nouveau.`;
      }
      if (refs && refs.length > 0) {
        instructions += `\n\nIMPORTANT: Utilise les informations de ces articles comme base principale. Lis leur contenu via tes outils de recherche si nécessaire : ${refs.join(', ')}`;
      }
      return instructions;
    };

    const commonInstructions = getContentInclusionInstructions(contentOptions, articleReferences);

    if (type === 'DISCOURS_THEME') {
      prompt = `Génère un thème de discours biblique accrocheur et profond basé sur les publications des Témoins de Jéhovah.
Critères de l'utilisateur (optionnel) : "${input || 'Aucun critère spécifique'}".
Langue : ${userLanguage}.
Le thème doit être court (moins de 10 mots), percutant, et adapté à un public chrétien.
Ne renvoie QUE le thème, sans guillemets ni texte supplémentaire.`;
    } else if (type === 'DISCOURS') {
      prompt = `Tu es un orateur chrétien expérimenté (Témoin de Jéhovah). Prépare un plan détaillé pour un discours biblique.
Type de discours : ${discoursType}
Thème : "${theme}"
Durée prévue : ${time}
Langue : ${userLanguage}
Préférences de l'utilisateur : ${userPreferences}

Le discours doit inclure :
1. Une introduction captivante.
2. Un développement structuré avec des sous-thèmes clairs et des versets bibliques pertinents (Traduction du monde nouveau).
3. Une conclusion motivante.
Assure-toi que le contenu est adapté à la durée prévue (${time}) et strictement basé sur les enseignements bibliques des Témoins de Jéhovah.
${commonInstructions}`;

      if (pointsToReinforce) prompt += `\nPoints à renforcer : ${pointsToReinforce}`;
      if (strengths) prompt += `\nPoints forts : ${strengths}`;
      if (encouragements) prompt += `\nEncouragements : ${encouragements}`;

    } else {
      const contentToAnalyze = manualText || input || text;
      // For PREDICATION, input might be an array or string, handle it gracefully
      const contentString = Array.isArray(contentToAnalyze) ? contentToAnalyze.join('\n') : contentToAnalyze;

      if (!contentString && type !== 'PREDICATION') { 
         // Allow empty input if it's just a template generation, but usually we need something.
      }

      // Check if contentString contains URLs
      const urlMatch = contentString ? contentString.match(/https?:\/\/[^\s]+/) : null;
      let scrapedContent = "";
      let urlInstructions = "";

      if (urlMatch) {
        const url = urlMatch[0];
        console.log(`Attempting to scrape URL: ${url}`);
        const scrapedText = await scrapeUrl(url);
        if (scrapedText) {
            scrapedContent = `\n\n--- SCRAPED CONTENT FROM ${url} ---\n${scrapedText}\n--- END SCRAPED CONTENT ---\n`;
            urlInstructions = "I have provided the scraped content from the URL above. Use this content as the primary source for your analysis. Do not invent information not present in the text.";
        } else {
            urlInstructions = "The input contains URLs. Use your Google Search tool to read the content of these URLs to inform your response. Do not just analyze the URL string itself. If the URL is from jw.org or wol.jw.org, prioritize the content from that source.";
        }
      }

      prompt = `Analyze the following content and provide a structured explanation based on user preferences.\nContent/Context: "${contentString}"\n${scrapedContent}\n${urlInstructions}\nUser Preferences: ${userPreferences}\n${commonInstructions}\n
      IMPORTANT: Your response must be strictly based on the provided content and the teachings found on jw.org and wol.jw.org. Use the Google Search tool to verify information on these sites if needed, especially looking for French content (lp-f, r30) if the user language is French.`;
      
      if (type === 'WATCHTOWER') {
        prompt += `This is a Watchtower study article. Format the response with a clear title, a summary, and a detailed, point-by-point explanation for each paragraph or section. IMPORTANT: Also include the revision questions at the end and provide answers based on the article content.`;
      } else if (type === 'MINISTRY') {
        prompt += `This is a Ministry Workbook meeting part (${part || 'full'}). Format the response appropriately for this specific part, providing practical points, scriptures, and clear explanations.`;
      } else if (type === 'PREDICATION') {
         prompt += `This is a preparation for field ministry (${preachingType}). 
         Context: ${contentString}
         Provide a prepared presentation or discussion points suitable for this ministry type.
         Include:
         - An engaging opening question or remark.
         - A scripture to share and explain.
         - A transition to a publication or a follow-up question.
         - Practical tips for handling common objections if applicable.`;
      } else {
        prompt += `Format the response with a clear title, a summary, and a detailed, point-by-point explanation.`;
      }
    }

    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
    });

    if (!result || !result.text) {
      throw new Error("AI returned empty response");
    }

    let title = "Generated Content";
    if (type === 'DISCOURS_THEME') {
      return res.status(200).json({ theme: result.text.trim() });
    } else if (type === 'DISCOURS') {
      title = theme;
    } else {
      const titleMatch = result.text.match(/^# (.*)/m);
      if (titleMatch) title = titleMatch[1];
    }

    res.status(200).json({ text: result.text, title });

  } catch (error) {
    console.error('API Error in generate-content:', error);
    
    // Check for API key expiration
    if (error.message && (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID'))) {
      return res.status(500).json({ 
        message: 'Your Gemini API Key has expired or is invalid. Please update GEMINI_API_KEY in your environment variables.', 
        details: error.message 
      });
    }

    res.status(500).json({ message: 'Failed to generate content.', details: error.message || String(error) });
  }
}
