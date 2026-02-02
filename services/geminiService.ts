
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
  const modelName = 'gemini-2.5-flash'; // Changé pour gemini-2.5-flash
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  let systemInstruction = '';
  let temperature = 0.1; // Par défaut pour une extraction précise

  if (isLink) {
    // Si c'est un lien direct, l'IA se concentre sur l'extraction sans trop d'interprétation.
    systemInstruction = `Assistant JW. Extrait et analyse l'article de ce lien pour le subdiviser.
    Structure: # [Titre] \n Thème: [Thème] \n PARAGRAPHE [N°]: Question, Verset, Réponse, Commentaire, Application. 
    Style: ${settings.answerPreferences || 'Précis'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else {
    // Pour une date/thème, l'IA doit utiliser la recherche, une température légèrement plus élevée l'aide à mieux formuler sa requête.
    systemInstruction = `Assistant JW. Utilise l'outil de recherche Google pour trouver l'article de JW.ORG correspondant à "${input}" pour "${type}", puis extrait et analyse son contenu.
    Structure: # [Titre] \n Thème: [Thème] \n PARAGRAPHE [N°]: Question, Verset, Réponse, Commentaire, Application. 
    Style: ${settings.answerPreferences || 'Précis'}. Réponds en Markdown.`;
    temperature = 0.4; // Plus élevé pour la flexibilité de la requête de recherche
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink 
        ? `Lien d'article à traiter: ${cleanedInput}` 
        : `Recherche et traite l'article pour: ${type} ${cleanedInput}`,
      config: {
        systemInstruction,
        temperature,
        tools: [{ googleSearch: {} }], // Toujours inclus, le modèle décide s'il l'utilise
        responseMimeType: "text/markdown", // Explicitement demander du Markdown
      },
    });

    const text = response.text || "";
    
    // Vérifier si la réponse est vide, trop courte, ou indique une erreur interne du modèle
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
    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        // Délais plus longs pour les limites globales
        const wait = (retryCount + 1) * 20000; // 20s, 40s
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("COOLDOWN_REQUIRED"); // Limite API globale
    }

    if (isSearchToolError) {
      if (retryCount < 1 && !isLink) { // Une seule tentative pour les erreurs de recherche sur les non-liens
         const wait = 15000; // Attendre 15 secondes avant de réessayer pour la recherche
         await sleep(wait);
         return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("SEARCH_QUOTA_EXCEEDED"); // Limite spécifique à l'outil de recherche
    }
    
    if (error.message === "MODEL_PROCESSING_ERROR") {
        throw new Error("L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente.");
    }

    throw new Error("Connexion interrompue ou erreur inconnue. Veuillez vérifier votre connexion ou réessayer.");
  }
};
