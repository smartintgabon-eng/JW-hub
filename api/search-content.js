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
    let diagnostic = "Diagnostic de la réponse : [Intelligence Pure] | Lien source : [Aucun]";
    let scrapedContent = "";
    let articleUrl = "";

    // --- PHASE 1: GROUNDING (Find URL) ---
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

      // Use Google Search Tool to find the URL
      const searchPrompt = `Find the single most relevant article URL on jw.org or wol.jw.org for: "${questionOrSubject}" in language "${userLanguage}".
      Return ONLY the URL as a plain string.`;
      
      const urlResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      const foundUrl = urlResult.text?.trim();
      if (foundUrl && foundUrl.startsWith('http')) {
        articleUrl = foundUrl;
        
        // --- PHASE 2: SCRAPING (Extract Text) ---
        // Note: Using fetch instead of axios for Edge Runtime compatibility as requested by best practices,
        // even though user asked for axios. Axios in Edge often fails due to missing 'http' module.
        // Cheerio works fine in Edge.
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
          scrapedContent = scrapedContent.replace(/\s+/g, ' ').trim().substring(0, 15000); // Large context window usage
          
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
    Si le contexte est vide, utilise tes connaissances internes (Intelligence Pure).
    
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
    // Fallback response instead of 500 if possible, but here it's a critical error in the handler itself
    return new Response(JSON.stringify({ message: 'Error', details: error.message }), { status: 500 });
  }
}
