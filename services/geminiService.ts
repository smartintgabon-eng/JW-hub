
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanUrl = (url: string): string => {
  try {
    const u = new URL(url.trim().replace(/[,.;]+$/, ''));
    return u.toString();
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
  if (!apiKey) throw new Error("Erreur système : Clé API non configurée.");

  const ai = new GoogleGenAI({ apiKey });
  // Utilisation de gemini-3-flash-preview pour le meilleur rapport vitesse/quota
  const modelName = 'gemini-3-flash-preview';
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  const systemInstruction = `Assistant JW.ORG. Tâche: Analyser l'article ${isLink ? 'du lien' : 'de la date'} et extraire par paragraphe: Question, Verset, Réponse, Commentaire, Application. Structure: # Titre \n Thème: [Thème] \n PARAGRAPHE X... ${settings.answerPreferences || ''}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink ? `Source: ${cleanedInput}` : `Recherche et étudie: ${type} ${cleanedInput}`,
      config: {
        systemInstruction,
        temperature: 0.1,
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (text.length < 50) throw new Error("Réponse vide du serveur.");

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude JW";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;
    
    if (isRateLimit && retryCount < 3) {
      // Backoff exponentiel : 5s, 15s, 30s
      const waitTime = Math.pow(retryCount + 1, 2) * 5000;
      await sleep(waitTime);
      return generateStudyContent(type, input, part, settings, retryCount + 1);
    }

    if (isRateLimit) {
      throw new Error("COOLDOWN_REQUIRED");
    }

    throw new Error("Impossible d'accéder à JW.ORG actuellement. Vérifiez votre connexion.");
  }
};
