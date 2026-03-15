import { GoogleGenAI } from '@google/genai';
import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { convert } from 'html-to-text';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
import metascraper from 'metascraper';
import metascraperImage from 'metascraper-image';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperUrl from 'metascraper-url';

const scraper = metascraper([
  metascraperImage(),
  metascraperTitle(),
  metascraperDescription(),
  metascraperUrl()
]);

// Helper for retrying Gemini calls
async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isQuotaError = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}

const scraperAxios = axios.create({
  timeout: 30000,
});

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

  let isConfirmMode = false;
  try {
    const body = await req.json();
    const { questionOrSubject, settings, confirmMode, contentOptions, part } = body;
    if (confirmMode) isConfirmMode = true;

    if (!questionOrSubject && !confirmMode) {
      return new Response(JSON.stringify({ message: 'Question or subject is required.' }), { status: 400 });
    }

    const ai = getAiClient();
    const userLanguage = settings?.language || 'fr';
    const today = new Date().toLocaleDateString(userLanguage, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const themeTitle = questionOrSubject || "Recherche";
    let diagnostic = "Diagnostic : [Recherche]";
    let scrapedContent = "";
    let articleUrl = "";
    let metadata = {};

    // Check if input is a direct URL
    const isDirectUrl = questionOrSubject && questionOrSubject.match(/^https?:\/\//);

    // --- PHASE 1: GROUNDING (Parallel Search via Google Search ONLY) ---
    try {
      let urlsToScrape = [];
      const groundingCacheKey = `grounding:${questionOrSubject}:${userLanguage}`;

      if (isDirectUrl) {
        urlsToScrape = [questionOrSubject.trim()];
        diagnostic = "Diagnostic : [Lien Direct + Scraping]";
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
          const searchPromptWol = `Recherche sur Google l'article le plus pertinent sur le site https://wol.jw.org/fr/wol/h/r30/lp-f pour le sujet : "${questionOrSubject}" en langue "${userLanguage}".`;
          const searchPromptJw = `Recherche sur Google l'article le plus pertinent sur le site https://www.jw.org/fr/rechercher/?q= pour le sujet : "${questionOrSubject}" en langue "${userLanguage}".`;
          
          const [wolResult, jwResult] = await Promise.allSettled([
            withRetry(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptWol, config: { tools: [{ googleSearch: {} }] } })),
            withRetry(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptJw, config: { tools: [{ googleSearch: {} }] } }))
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

      articleUrl = urlsToScrape[0] || "";

      if (urlsToScrape.length > 0) {
        // --- PHASE 2: SCRAPING (25s Timeout) ---
        const scrapePromises = urlsToScrape.map(async (url) => {
          const scrapeCacheKey = `scrape:${url}`;
          
          // Check if we already scraped this specific URL
          if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            try {
              const cachedText = await kv.get(scrapeCacheKey);
              if (cachedText) return cachedText;
            } catch (e) {
              console.warn("KV Cache read error:", e);
            }
          }

          try {
            const response = await scraperAxios.get(url, {
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/'
              }
            });
            
            if (response.status === 200) {
              const html = response.data;
              
              // Extract metadata using metascraper
              const meta = await scraper({ html, url });
              
              const $ = cheerio.load(html);
              $('script, style, nav, footer, header, aside, .navigation, .site-header, .site-footer, .advertisement, .share-options').remove();
              
              const contentNode = $('article, main, #article').first();
              const rootNode = contentNode.length ? contentNode : $('body');
              
              // Try to find the first image in the content if metascraper didn't find one
              let firstImage = meta.image || "";
              if (!firstImage) {
                const img = rootNode.find('img').first();
                if (img.length) {
                  const src = img.attr('src');
                  if (src) {
                    firstImage = src.startsWith('http') ? src : new URL(src, url).href;
                  }
                }
              }

              // Use html-to-text for clean extraction
              let text = convert(rootNode.html() || "", {
                wordwrap: false,
                selectors: [
                  { selector: 'img', format: 'skip' },
                  { selector: 'a', options: { ignoreHref: true } }
                ]
              });
              
              text = text.replace(/\n{3,}/g, '\n\n').trim();
              
              if (!text) {
                text = rootNode.text().replace(/\s+/g, ' ').trim();
              }
              
              const resultObj = { text, imageUrl: firstImage, title: meta.title || "", description: meta.description || "" };
              
              // Cache the scraped text
              if (text && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
                try {
                  await kv.set(scrapeCacheKey, resultObj, { ex: 86400 * 30 }); // Cache for 30 days
                } catch (e) {
                  console.warn("KV Cache write error:", e);
                }
              }
              return resultObj;
            }
          } catch (e) {
            console.warn(`Scraping failed for ${url}:`, e.message);
          }
          return { text: "", imageUrl: "", title: "", description: "" };
        });

        const results = await Promise.all(scrapePromises);
        const validResults = results.filter(t => t && t.text && t.text.length > 0);
        
        if (validResults.length > 0) {
          scrapedContent = validResults.map(t => t.text).join('\n\n---\n\n').substring(0, 15000);
          const firstValid = validResults.find(t => t.imageUrl || t.title);
          if (firstValid) {
            metadata = firstValid;
            if (firstValid.imageUrl) {
              scrapedContent += `\n\n[IMAGE_URL: ${firstValid.imageUrl}]`;
            }
          }
          if (!isDirectUrl) diagnostic = `Diagnostic : [Grounding + Scraping]`;
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

    // Handle confirmMode (Preview)
    if (confirmMode) {
      const previewPrompt = `
      Génère un aperçu JSON détaillé pour l'article à l'URL "${articleUrl}" (ou basé sur la requête "${questionOrSubject}").
      Titre extrait : "${metadata.title || ''}"
      Description extraite : "${metadata.description || ''}"
      Contexte extrait : "${scrapedContent.substring(0, 4000)}..."
      
      INSTRUCTIONS :
      1. Identifie précisément l'image principale de l'article.
      2. Extrais le Thème exact.
      3. Identifie le Thème Principal ou la leçon centrale de l'article.
      4. Trouve le Verset Clé cité ou mis en avant.
      
      Renvoie un objet JSON avec :
      - previewTitle: Titre de l'article
      - previewSummary: Bref résumé (2 phrases max)
      - previewImage: URL de l'image (utilise [IMAGE_URL: ...] si présent dans le contexte)
      - previewInfos: Source ou date
      - theme: Le thème de l'article
      - mainTheme: Le thème principal ou la leçon centrale
      - keyVerse: Le verset clé (ex: "Psaume 119:105")
      - url: "${articleUrl}"
      
      Renvoie UNIQUEMENT du JSON valide.`;

      const config = { responseMimeType: 'application/json' };
      if (!scrapedContent) {
        config.tools = [{ googleSearch: {} }];
      }

      const result = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: previewPrompt,
        config
      }));
      
      return new Response(result.text, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- PHASE 3: GENERATION ---
    let contentInclusionInstructions = "";
    if (contentOptions) {
      if (contentOptions.includeArticles) contentInclusionInstructions += "Include references to other relevant articles from jw.org or wol.jw.org.\n";
      if (contentOptions.includeImages) contentInclusionInstructions += "Describe relevant images or visual aids that could be used.\n";
      if (contentOptions.includeVideos) contentInclusionInstructions += "Suggest relevant videos from jw.org.\n";
      contentInclusionInstructions += "Include key Bible verses (NWT) - this is MANDATORY.\n";
    }

    const prompt = `
    Question/Sujet : "${questionOrSubject}"
    Langue : ${userLanguage}
    ${part && part !== 'tout' ? `SECTION SPÉCIFIQUE : ${part.replace(/_/g, ' ')}` : ""}
    
    CONTEXTE PRINCIPAL (SCRAPPÉ) :
    "${scrapedContent}"
    
    INSTRUCTIONS :
    1. Utilise PRINCIPALEMENT le contexte scrappé ci-dessus pour générer ta réponse.
    2. Ajoute ta propre réflexion, analyse et méditation spirituelle pour enrichir la réponse.
    3. Si le contexte est vide, ignore le scraping et utilise UNIQUEMENT le contenu brut fourni par la recherche Google (Grounding).
    4. OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${themeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*".
    
    ${contentInclusionInstructions}
    
    Structure de la réponse :
    1. Introduction directe.
    2. Points clés basés sur les publications.
    3. Versets bibliques expliqués.
    4. Conclusion pratique.
    5. SOURCES : Liste les liens utilisés.
    
    Formatte en Markdown.
    
    IMPORTANT : À la toute fin de ta réponse, ajoute cette ligne exacte :
    ${diagnostic}`;

    // Stream Generation
    const stream = await withRetry(() => ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      // We don't need googleSearch tool here if we already scraped, 
      // but keeping it doesn't hurt if scraping failed (fallback).
      config: { tools: [{ googleSearch: {} }] }
    }));

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
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
    
    // Fallback message requested by user
    const errorMessage = "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer.";
    
    // If it's a JSON request (like confirmMode), return JSON
    if (isConfirmMode) {
      return new Response(JSON.stringify({ message: errorMessage }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Otherwise return a stream with the error message so the UI displays it gracefully
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
