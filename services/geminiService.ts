
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
  const modelName = 'gemini-3-flash-preview';
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  // Prompt ultra-court pour économiser les tokens
  const systemInstruction = `Assistant JW. Analyser ${isLink ? 'ce lien' : 'cette date'}. 
  Structure: # [Titre] \n Thème: [Thème] \n PARAGRAPHE [N°]: Question, Verset, Réponse, Commentaire, Application. 
  Style: ${settings.answerPreferences || 'Précis'}.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink ? `Traite cet article : ${cleanedInput}` : `Cherche l'étude du ${cleanedInput} pour : ${type}`,
      config: {
        systemInstruction,
        temperature: 0.1,
        // On n'active l'outil de recherche QUE si ce n'est pas un lien direct ou si le lien échoue
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    
    if (!text || text.length < 50) {
      throw new Error("EMPTY_RESPONSE");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude Biblique";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    console.error("Gemini Details:", error);
    
    const errorStr = error.toString();
    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        const wait = (retryCount + 1) * 8000;
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("COOLDOWN_REQUIRED");
    }

    if (errorStr.includes('Search') || errorStr.includes('tool')) {
      throw new Error("L'outil de recherche Google est saturé. Réessayez avec un lien direct JW.ORG pour contourner la recherche.");
    }

    throw new Error("Connexion interrompue. Vérifiez votre lien ou réessayez dans quelques minutes.");
  }
};
