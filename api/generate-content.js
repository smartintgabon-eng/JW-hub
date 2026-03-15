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

    const ai = getAiClient();
    let prompt = '';
    const userLanguage = settings?.language || 'fr';
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';
    const today = new Date().toLocaleDateString(userLanguage, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const themeTitle = input || theme || "Analyse";

    const contentToAnalyze = manualText || input || text;
    const contentString = Array.isArray(contentToAnalyze) ? contentToAnalyze.join('\n') : contentToAnalyze;
    
    // Determine if we should use search/scraping
    const isManualText = !!manualText;
    const urlMatch = contentString && !isManualText ? contentString.match(/https?:\/\/[^\s]+/) : null;
    const withSearch = !isManualText && (!!urlMatch || (contentOptions && contentOptions.includeArticles) || (articleReferences && articleReferences.length > 0));
    
    let diagnostic = isManualText ? "Diagnostic : [Analyse de texte manuel]" : "Diagnostic : [Recherche]";
    let scrapedContent = "";
    let articleUrl = "";

    // --- PHASE 1 & 2: GROUNDING + SCRAPING (If applicable) ---
    if (withSearch && !isInitialSearchForPreview) {
      try {
        let urlsToScrape = [];
        const groundingCacheKey = `grounding:${input || theme}:${userLanguage}`;

        if (urlMatch) {
            urlsToScrape.push(urlMatch[0]);
        } else if (articleReferences && articleReferences.length > 0) {
            urlsToScrape.push(articleReferences[0]);
        } else {
           // 1. Check if we already have the URLs cached for this exact query
           if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
             try {
               const cachedUrls = await kv.get(groundingCacheKey);
               if (cachedUrls && Array.isArray(cachedUrls) && cachedUrls.length > 0) {
                 urlsToScrape = cachedUrls;
                 diagnostic = "Diagnostic : [Grounding en Cache + Scraping]";
               }
             } catch (e) {
               console.warn("KV Cache read error:", e);
             }
           }

           // 2. If no cached URLs, perform the Google Search
           if (urlsToScrape.length === 0) {
             // Parallel search strictly on wol.jw.org and jw.org using Gemini's Google Search tool
             const searchPromptWol = `Recherche sur Google l'article le plus pertinent sur le site wol.jw.org pour le sujet : "${input || theme}" en langue "${userLanguage}".`;
             const searchPromptJw = `Recherche sur Google l'article le plus pertinent sur le site jw.org pour le sujet : "${input || theme}" en langue "${userLanguage}".`;
             
             const [wolResult, jwResult] = await Promise.allSettled([
               ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptWol, config: { tools: [{ googleSearch: {} }] } }),
               ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptJw, config: { tools: [{ googleSearch: {} }] } })
             ]);
            
             const extractUrl = (text) => {
               if (!text) return null;
               const match = text.match(/https?:\/\/[^\s"']+/);
               return match ? match[0] : null;
             };

             const extractUrlsFromGrounding = (result) => {
               const urls = [];
               if (result.status === 'fulfilled' && result.value.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                 const chunks = result.value.candidates[0].groundingMetadata.groundingChunks;
                 for (const chunk of chunks) {
                   if (chunk.web?.uri) {
                     urls.push(chunk.web.uri);
                   }
                 }
               }
               if (result.status === 'fulfilled' && result.value.text) {
                  const textUrl = extractUrl(result.value.text);
                  if (textUrl) urls.push(textUrl);
               }
               return urls;
             };

             const wolUrls = extractUrlsFromGrounding(wolResult);
             const jwUrls = extractUrlsFromGrounding(jwResult);

             urlsToScrape = [...new Set([...wolUrls, ...jwUrls].filter(url => url && (url.includes('jw.org') || url.includes('wol.jw.org'))))];
            
            // Cache the found URLs
            if (urlsToScrape.length > 0 && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
              try {
                await kv.set(groundingCacheKey, urlsToScrape, { ex: 86400 * 7 }); // Cache for 7 days
              } catch (e) {
                console.warn("KV Cache write error:", e);
              }
            }
          }
        }

        if (urlsToScrape.length > 0) {
           // Scraping (5s Timeout)
           const scrapePromises = urlsToScrape.map(async (url) => {
             const scrapeCacheKey = `scrape:${url}`;
             
             // Check if we already scraped this specific URL
             if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
               try {
                 const cachedText = await kv.get(scrapeCacheKey);
                 if (cachedText) return cachedText;
               } catch (e) {}
             }

             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 5000);
             try {
               const response = await fetch(url, {
                 signal: controller.signal,
                 headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
               });
               clearTimeout(timeoutId);
               if (response.ok) {
                 const html = await response.text();
                 const $ = cheerio.load(html);
                 $('script, style, nav, footer, header, aside, .navigation, .site-header, .site-footer, .advertisement, .share-options').remove();
                 let text = $('article, main, .docTitle, .docSubTitle, .bodyTxt, .pGroup, #article').text() || $('body').text();
                 text = text.replace(/\s+/g, ' ').trim();
                 
                 // Cache the scraped text
                 if (text && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
                   try {
                     await kv.set(scrapeCacheKey, text, { ex: 86400 * 30 }); // Cache for 30 days
                   } catch (e) {}
                 }
                 return text;
               }
             } catch (e) {
               clearTimeout(timeoutId);
               console.warn(`Scraping failed for ${url}:`, e);
             }
             return "";
           });

           const results = await Promise.all(scrapePromises);
           const validTexts = results.filter(t => t.length > 0);
           
           if (validTexts.length > 0) {
             scrapedContent = validTexts.join('\n\n---\n\n').substring(0, 15000);
             diagnostic = `Diagnostic : [Grounding + Scraping]`;
           } else {
             diagnostic = `Diagnostic : [Recherche]`;
           }
        } else {
           diagnostic = `Diagnostic : [Recherche]`;
        }

      } catch (e) {
        console.warn("Grounding failed, falling back to Pure Intelligence:", e);
        diagnostic = `Diagnostic : [Recherche]`;
      }
    }
    
    // Reconstruct the prompt logic briefly
    if (type === 'DISCOURS_THEME') {
        prompt = `Génère un thème de discours biblique accrocheur et profond basé sur les publications des Témoins de Jéhovah.
Critères : "${input || 'Aucun'}". Langue : ${userLanguage}. Court et percutant. Ne renvoie QUE le thème, sans aucun autre texte.`;
    } else if (type === 'DISCOURS') {
        prompt = `OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${themeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*".

Orateur chrétien (TJ). Plan discours biblique.
Type: ${discoursType}, Thème: "${theme}", Durée: ${time}, Langue: ${userLanguage}.
Prefs: ${userPreferences}.
Inclure versets et articles.
CONTEXTE SCRAPPÉ (si dispo): "${scrapedContent}"
${contentOptions ? 'Utilise ce contexte pour enrichir le discours.' : ''}
${pointsToReinforce ? `Points à renforcer: ${pointsToReinforce}` : ''}
${strengths ? `Points forts: ${strengths}` : ''}
${encouragements ? `Encouragements: ${encouragements}` : ''}`;
    } else if (type === 'PREDICATION') {
        prompt = `OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${themeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*".

Tu es un proclamateur chrétien (Témoin de Jéhovah) expérimenté.
Prépare une présentation de prédication.
Type de prédication: ${preachingType || 'Non spécifié'}
Sujet / Contenu de base: "${contentString}"
Prefs: ${userPreferences}
Langue: ${userLanguage}
${articleReferences && articleReferences.length > 0 ? `Références articles: ${articleReferences.join(', ')}` : ''}
CONTEXTE SCRAPPÉ (si dispo): "${scrapedContent}"

INSTRUCTIONS :
1. Rédige une présentation naturelle, conversationnelle et biblique.
2. Inclus une question d'introduction, un verset biblique, et une question en suspens.
3. Utilise le contexte scrappé si pertinent.
Format Markdown.`;
    } else if (type === 'WATCHTOWER' || type === 'MINISTRY') {
        prompt = `OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${themeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*".

Tu es un assistant pour l'étude personnelle des Témoins de Jéhovah.
Type d'étude: ${type === 'WATCHTOWER' ? 'Étude de La Tour de Garde' : 'Cahier Vie Chrétienne et Ministère'}
Contenu source (texte collé ou lien): "${contentString}"
Prefs: ${userPreferences}
Langue: ${userLanguage}
${articleReferences && articleReferences.length > 0 ? `Références articles: ${articleReferences.join(', ')}` : ''}
CONTEXTE SCRAPPÉ (si dispo): "${scrapedContent}"

INSTRUCTIONS CRUCIALES :
1. Ton but principal est de FOURNIR LES RÉPONSES AUX QUESTIONS posées dans le texte source. Ne te contente SURTOUT PAS de répéter le texte.
2. Pour chaque paragraphe ou section contenant une question, donne :
   - Une réponse directe et claire basée sur le texte.
   - Des commentaires supplémentaires ou des explications bibliques profondes.
   - Une "Application dans la vie" (comment appliquer ce point au quotidien ou dans le ministère).
3. Si le texte source est un article complet, identifie les questions d'étude et réponds-y.
4. Si le texte source ne contient pas de questions explicites, dégage les points principaux et fournis des commentaires enrichissants et des applications pratiques.
5. Utilise le contexte scrappé comme source principale si disponible, sinon utilise le texte fourni.

Format Markdown structuré (utilise des sous-titres H2/H3, des puces, du gras pour mettre en valeur les réponses).`;
    } else {
        prompt = `Analyse et explication structurée.
Contenu: "${contentString}"
Prefs: ${userPreferences}
Langue: ${userLanguage}
CONTEXTE SCRAPPÉ (si dispo): "${scrapedContent}"

INSTRUCTIONS :
1. Utilise le contenu scrappé ci-dessus comme source principale.
2. Ajoute ta propre réflexion, analyse et méditation spirituelle pour enrichir la réponse.
3. Si le contexte est vide, ignore le scraping et utilise UNIQUEMENT le contenu brut fourni.
4. OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${themeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*".

Format Markdown.`;
    }
    
    prompt += `\n\nIMPORTANT : À la toute fin de ta réponse, ajoute cette ligne exacte :\n${diagnostic}`;

    // Stream Generation
    const config = withSearch ? { tools: [{ googleSearch: {} }] } : {};
    
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          
          // No Vercel KV Cache write here, strictly Gemini generation
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
    const errorMessage = "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer.";
    
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
