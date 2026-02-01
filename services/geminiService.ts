
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Nettoie l'entrée utilisateur pour éviter les erreurs de recherche
 */
const cleanInput = (input: string): string => {
  let cleaned = input.trim();
  // Retire les virgules ou points accidentels à la fin de l'URL
  cleaned = cleaned.replace(/[,.;]+$/, '');
  return cleaned;
};

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings,
  retryCount = 0
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante. Veuillez rafraîchir la page.");

  const ai = new GoogleGenAI({ apiKey });
  // Utilisation de gemini-3-flash-preview pour sa vitesse, 
  // mais avec une gestion stricte des erreurs de quota.
  const modelName = 'gemini-3-flash-preview';
  
  const rawInput = cleanInput(input);
  const isLink = rawInput.startsWith('http');
  const isDate = !isLink && /^\d{4}-\d{2}-\d{2}$/.test(rawInput);

  let searchQuery = rawInput;
  if (isDate) {
    const dateObj = new Date(rawInput);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    searchQuery = `site:jw.org article ${type === 'WATCHTOWER' ? 'étude Tour de Garde' : 'vie et ministère'} ${formattedDate}`;
  }

  const systemInstruction = `
    RÔLE : Assistant d'étude JW.ORG.
    
    IMPORTANT : Si un lien est fourni, analyse UNIQUEMENT ce lien. Si c'est une recherche, trouve l'article exact.
    
    STRUCTURE DE RÉPONSE :
    # [TITRE DE L'ARTICLE]
    Thème : [Thème]
    
    PARAGRAPHE 1
    QUESTION : [Texte]
    VERSET : [Citations]
    RÉPONSE : [Précise et basée sur le texte]
    COMMENTAIRE : [Encourageant]
    APPLICATION : [Pratique]
    
    (Continue pour tous les paragraphes)
    
    ${settings.answerPreferences ? `PRÉFÉRENCES : ${settings.answerPreferences}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink ? `Analyse cet article : ${rawInput}` : `Prépare l'étude pour : ${searchQuery}`,
      config: {
        systemInstruction,
        temperature: 0.15,
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (!text || text.length < 100) {
       throw new Error("L'article n'a pas pu être lu correctement. Vérifiez le lien.");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude JW";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Si on dépasse le quota (Erreur 429)
    if (error.message?.includes('429')) {
      if (retryCount < 3) {
        const waitTime = (retryCount + 1) * 5000; // Attend 5s, puis 10s, puis 15s
        console.warn(`Quota atteint. Nouvelle tentative dans ${waitTime/1000}s...`);
        await sleep(waitTime);
        return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("LIMITE ATTEINTE : Google limite l'utilisation gratuite de l'IA. Veuillez attendre 2 à 3 minutes sans cliquer sur le bouton.");
    }

    // Autres erreurs
    throw new Error(error.message || "Erreur de connexion aux serveurs de recherche.");
  }
};
