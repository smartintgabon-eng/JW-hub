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
    const { questionOrSubject, settings, confirmMode, contentOptions, part } = body;

    if (!questionOrSubject && !confirmMode) {
      return new Response(JSON.stringify({ message: 'Question or subject is required.' }), { status: 400 });
    }

    const ai = getAiClient();
    const userLanguage = settings?.language || 'fr';
    let diagnostic = "Diagnostic : [Recherche]";
    let scrapedContent = "";
    let articleUrl = "";

    // --- PHASE 1: GROUNDING (Parallel Search) ---
    try {
      // Check Cache (KV) first
      const cacheKey = `search:${questionOrSubject}:${settings?.language || 'fr'}:${part || 'all'}`;
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          const cached = await kv.get(cacheKey);
          if (cached) {
            return new Response(JSON.stringify({ text: cached }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (e) {
          console.warn("KV Cache read error:", e);
        }
      }

      // Parallel search on wol.jw.org and jw.org
      const searchPromptWol = `Find the single most relevant article URL on wol.jw.org for: "${questionOrSubject}" in language "${userLanguage}". Return ONLY the URL as a plain string.`;
      const searchPromptJw = `Find the single most relevant article URL on jw.org for: "${questionOrSubject}" in language "${userLanguage}". Return ONLY the URL as a plain string.`;
      
      const [wolResult, jwResult] = await Promise.allSettled([
        ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptWol, config: { tools: [{ googleSearch: {} }] } }),
        ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: searchPromptJw, config: { tools: [{ googleSearch: {} }] } })
      ]);
      
      const wolUrl = wolResult.status === 'fulfilled' ? wolResult.value.text?.trim() : null;
      const jwUrl = jwResult.status === 'fulfilled' ? jwResult.value.text?.trim() : null;

      articleUrl = (wolUrl && wolUrl.startsWith('http')) ? wolUrl : ((jwUrl && jwUrl.startsWith('http')) ? jwUrl : null);

      if (articleUrl) {
        // --- PHASE 2: SCRAPING (5s Timeout) ---
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(articleUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const html = await response.text();
            const $ = cheerio.load(html);
            
            // Remove non-content
            $('script, style, nav, footer, header, aside, .navigation, .site-header, .site-footer, .advertisement, .share-options').remove();
            
            // Extract content
            scrapedContent = $('article, main, .docTitle, .docSubTitle, .bodyTxt, .pGroup, #article').text() || $('body').text();
            scrapedContent = scrapedContent.replace(/\s+/g, ' ').trim().substring(0, 15000); // Large context window usage
            
            diagnostic = `Diagnostic : [Scraping]`;
          }
        } catch (e) {
          clearTimeout(timeoutId);
          console.warn("Scraping failed or timed out:", e);
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
      // If we have scraped content, we can extract metadata manually or ask AI
      // For speed/simplicity in preview, we'll ask AI to format the preview JSON
      const previewPrompt = `
      Generate a JSON preview for the article at "${articleUrl}" (or based on query "${questionOrSubject}").
      Context: "${scrapedContent.substring(0, 2000)}..."
      
      Return JSON object with:
      - previewTitle: Title
      - previewSummary: Short summary
      - previewImage: URL of image (or placeholder)
      - previewInfos: Source/Theme verse
      - url: "${articleUrl}"
      
      Return ONLY valid JSON.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: previewPrompt,
        config: { responseMimeType: 'application/json' }
      });
      
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
    Utilise PRINCIPALEMENT le contexte scrappé ci-dessus pour répondre.
    Si le contexte est vide, ignore le scraping et utilise UNIQUEMENT le contenu brut fourni par la recherche Google (Grounding).
    
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
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      // We don't need googleSearch tool here if we already scraped, 
      // but keeping it doesn't hurt if scraping failed (fallback).
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
          
          // Cache the full result after streaming
          if (fullText && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
             try {
                const cacheKey = `search:${questionOrSubject}:${settings?.language || 'fr'}:${part || 'all'}`;
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
    
    // Fallback message requested by user
    const errorMessage = "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer.";
    
    // If it's a JSON request (like confirmMode), return JSON
    let isConfirmMode = false;
    try {
      // Try to parse if not already parsed, but in most cases it failed during processing
      // We can check if we already have confirmMode from the top of the function
      if (typeof confirmMode !== 'undefined' && confirmMode) {
        isConfirmMode = true;
      }
    } catch(e) {}

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
