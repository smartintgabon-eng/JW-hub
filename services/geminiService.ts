
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanUrl = (url: string): string => {
  try {
    const trimmed = url.trim().replace(/[,.;]+$/, '');
    if (trimmed.startsWith('http')) {
      const u = new URL(trimmed);
      return u.toString();
    }
    return trimmed;
  } catch {
    return url.trim().replace(/[,.;]+$/, '');
  }
};

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings,
  retryCount = 0
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API absente. Vérifiez votre configuration.");

  const ai = new GoogleGenAI({ apiKey });
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  // Choisir le modèle dynamiquement:
  // - Pour les liens directs, utiliser le modèle configuré par l'utilisateur (par défaut gemini-2.5-flash).
  // - Pour la recherche (date/thème), utiliser gemini-3-flash-preview car il supporte googleSearch.
  const modelToUse = isLink ? settings.modelName : 'gemini-3-flash-preview';

  let systemInstruction = '';
  let temperature = 0.1;

  if (isLink) {
    systemInstruction = `Assistant JW. Extrait et analyse l'article de ce lien pour le subdiviser.
    Structure: # [Titre] \n Thème: [Thème] \n PARAGRAPHE [N°]: Question, Verset, Réponse, Commentaire, Application. 
    Style: ${settings.answerPreferences || 'Précis'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else {
    systemInstruction = `Assistant JW. Utilise l'outil de recherche Google pour trouver l'article de JW.ORG correspondant à "${input}" pour "${type}", puis extrait et analyse son contenu.
    Structure: # [Titre] \n Thème: [Thème] \n PARAGRAPHE [N°]: Question, Verset, Réponse, Commentaire, Application. 
    Style: ${settings.answerPreferences || 'Précis'}. Réponds en Markdown.`;
    temperature = 0.4;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: isLink 
        ? `Lien d'article à traiter: ${cleanedInput}` 
        : `Recherche et traite l'article pour: ${type} ${cleanedInput}`,
      config: {
        systemInstruction,
        temperature,
        tools: [{ googleSearch: {} }], // Toujours inclus, le modèle compatible décidera s'il l'utilise
      },
    });

    const text = response.text || "";
    
    if (!text || text.length < 50 || text.toLowerCase().includes('désolé') || text.toLowerCase().includes('impossible de trouver')) {
      throw new Error("MODEL_PROCESSING_ERROR");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude Biblique";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorStr = JSON.stringify(error); // Stringify for robust error checking
    const status = error.status || (error.response && error.response.status); // Get HTTP status if available

    // Specific API key/billing errors
    if (status === 401 || errorStr.includes('Unauthorized') || errorStr.includes('invalid API key')) {
        throw new Error("INVALID_API_KEY");
    }
    // Les modèles utilisant des outils (comme googleSearch) nécessitent la facturation,
    // donc cette erreur est plus probable pour le modèle gemini-3-flash-preview.
    if (status === 403 || errorStr.includes('Forbidden') || errorStr.includes('billing')) {
        throw new Error("BILLING_REQUIRED");
    }

    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    // Une erreur de l'outil de recherche est maintenant mieux gérée par le changement de modèle,
    // mais si elle persiste, c'est probablement un quota de l'outil.
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        const wait = (retryCount + 1) * 20000;
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("COOLDOWN_REQUIRED");
    }

    if (isSearchToolError) {
      if (retryCount < 1 && !isLink) {
         const wait = 15000;
         await sleep(wait);
         return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("SEARCH_QUOTA_EXCEEDED");
    }
    
    if (error.message === "MODEL_PROCESSING_ERROR") {
        throw new Error("L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente.");
    }

    // Erreur générique avec le statut si disponible, pour le diagnostic.
    throw new Error(`GENERIC_API_ERROR: ${status || 'unknown'}`);
  }
};