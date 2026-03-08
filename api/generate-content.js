import { GoogleGenAI } from '@google/genai';
import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export const config = {
  runtime: 'edge',
};

// Helper to get AI client
function getAiClient() {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.REACT_APP_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.API_KEY
  ];
  
  let apiKey = candidates.find(k => k && k.trim().startsWith('AIza'));
  if (!apiKey) {
    apiKey = candidates.find(k => k && k.trim().length > 0);
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }
  
  const validApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  return new GoogleGenAI({ apiKey: validApiKey });
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { 
      input, 
      manualText, 
      text, 
      settings, 
      type, 
      part, 
      discoursType, 
      time, 
      theme, 
      articleReferences, 
      pointsToReinforce, 
      strengths, 
      encouragements, 
      contentOptions, 
      preachingType,
      isInitialSearchForPreview 
    } = body;

    // Check Cache (KV)
    // Create a simple hash or key based on input
    const cacheKey = `gen:${type}:${theme || input || 'default'}:${settings?.language || 'fr'}:${part || 'all'}`;
    
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cached = await kv.get(cacheKey);
        if (cached) {
          return new Response(JSON.stringify({ text: cached }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (e) {
      console.warn("KV Cache read error:", e);
    }

    const ai = getAiClient();
    let prompt = '';
    const userLanguage = settings?.language || 'fr';
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

    // Construct Prompt (Simplified for Edge - no scraping here, relying on input or search if needed)
    // If scraping was needed, we assume it's done or we use Google Search tool if requested.
    // The previous code had scraping logic. We'll replace it with Google Search tool if URL is present.
    
    const contentToAnalyze = manualText || input || text;
    const contentString = Array.isArray(contentToAnalyze) ? contentToAnalyze.join('\n') : contentToAnalyze;
    const urlMatch = contentString ? contentString.match(/https?:\/\/[^\s]+/) : null;
    
    const withSearch = !!urlMatch || (contentOptions && contentOptions.includeArticles) || (articleReferences && articleReferences.length > 0);
    
    let diagnostic = "Diagnostic de la réponse : [Intelligence Pure] | Lien source : [Aucun]";
    let scrapedContent = "";
    let articleUrl = "";

    // --- PHASE 1 & 2: GROUNDING + SCRAPING (If applicable) ---
    if (withSearch && !isInitialSearchForPreview) {
      try {
        if (urlMatch) {
            articleUrl = urlMatch[0];
        } else if (articleReferences && articleReferences.length > 0) {
           articleUrl = articleReferences[0];
        } else {
           // Find URL via Google Search
           const searchPrompt = `Find the single most relevant article URL on jw.org or wol.jw.org for: "${input || theme}" in language "${userLanguage}".
           Return ONLY the URL as a plain string.`;
           
           const urlResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: searchPrompt,
            config: { tools: [{ googleSearch: {} }] }
          });
          
          const foundUrl = urlResult.text?.trim();
          if (foundUrl && foundUrl.startsWith('http')) {
            articleUrl = foundUrl;
          }
        }

        if (articleUrl) {
           // Scraping
           const response = await fetch(articleUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
              }
            });
            
            if (response.ok) {
              const html = await response.text();
              const $ = cheerio.load(html);
              
              // Remove non-content
              $('script, style, nav, footer, header, aside, .navigation, .site-header, .site-footer, .advertisement, .share-options').remove();
              
              // Extract content
              scrapedContent = $('article, main, .docTitle, .docSubTitle, .bodyTxt, .pGroup, #article').text() || $('body').text();
              scrapedContent = scrapedContent.replace(/\s+/g, ' ').trim().substring(0, 15000);
              
              diagnostic = `Diagnostic de la réponse : [Scraping réussi] | Lien source : [${articleUrl}]`;
            } else {
              diagnostic = `Diagnostic de la réponse : [Scraping échoué (HTTP ${response.status})] | Lien source : [${articleUrl}]`;
            }
        } else {
           diagnostic = `Diagnostic de la réponse : [Grounding échoué (URL non trouvée)] | Lien source : [Aucun]`;
        }

      } catch (e) {
        console.warn("Grounding/Scraping failed, falling back to Pure Intelligence:", e);
        diagnostic = `Diagnostic de la réponse : [Erreur système récupérée] | Lien source : [Aucun]`;
      }
    }
    
    // Reconstruct the prompt logic briefly
    if (type === 'DISCOURS_THEME') {
        prompt = `Génère un thème de discours biblique accrocheur et profond basé sur les publications des Témoins de Jéhovah.
Critères : "${input || 'Aucun'}". Langue : ${userLanguage}. Court et percutant.`;
    } else if (type === 'DISCOURS') {
        prompt = `Orateur chrétien (TJ). Plan discours biblique.
Type: ${discoursType}, Thème: "${theme}", Durée: ${time}, Langue: ${userLanguage}.
Prefs: ${userPreferences}.
Inclure versets et articles.
CONTEXTE SCRAPPÉ (si dispo): "${scrapedContent}"
${contentOptions ? 'Utilise ce contexte pour enrichir le discours.' : ''}
${pointsToReinforce ? `Points à renforcer: ${pointsToReinforce}` : ''}
${strengths ? `Points forts: ${strengths}` : ''}
${encouragements ? `Encouragements: ${encouragements}` : ''}`;
    } else {
        prompt = `Analyse et explication structurée.
Contenu: "${contentString}"
Prefs: ${userPreferences}
Langue: ${userLanguage}
${preachingType ? `Type de prédication: ${preachingType}` : ''}
${articleReferences && articleReferences.length > 0 ? `Références articles: ${articleReferences.join(', ')}` : ''}

INSTRUCTIONS :
Utilise le contenu scrappé ci-dessus comme source principale.
Si vide, utilise tes connaissances.

Format Markdown.`;
    }
    
    prompt += `\n\nIMPORTANT : À la toute fin de ta réponse, ajoute cette ligne exacte :\n${diagnostic}`;

    // Stream Generation
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          
          // Cache result
          if (fullText && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
             try {
                await kv.set(cacheKey, fullText, { ex: 86400 });
             } catch(e) { console.warn("Cache write failed", e); }
          }
          
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: 'Error', details: error.message }), { status: 500 });
  }
}
