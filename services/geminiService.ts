
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings,
  retryCount = 0
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview';
  
  const isLink = input.startsWith('http');
  const isDate = !isLink && /^\d{4}-\d{2}-\d{2}$/.test(input);

  let searchQuery = input;
  if (isDate) {
    const dateObj = new Date(input);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    searchQuery = `site:jw.org ${type === 'WATCHTOWER' ? 'article étude Tour de Garde' : 'cahier vie et ministère'} semaine du ${formattedDate}`;
  } else if (!isLink) {
    searchQuery = `site:jw.org ${type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier réunion'} ${input}`;
  }

  const systemInstruction = `
    RÔLE : Assistant d'étude JW.ORG.
    
    INSTRUCTION : Tu DOIS utiliser l'outil googleSearch pour accéder au contenu réel de jw.org. 
    Ne te base jamais sur tes connaissances internes.
    
    TACHE :
    1. Trouve et lis l'article source : "${searchQuery}".
    2. Génère l'étude complète paragraphe par paragraphe.
    
    STRUCTURE :
    # [TITRE]
    Thème : [Sujet]
    
    PARAGRAPHE X
    QUESTION : [Texte]
    VERSET : [Citations]
    RÉPONSE : [Précise]
    COMMENTAIRE : [Encourageant]
    APPLICATION : [Pratique]
    
    ${settings.answerPreferences ? `PRÉFÉRENCES : ${settings.answerPreferences}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink ? `Analyse cet article : ${input}` : `Cherche l'étude : ${searchQuery}`,
      config: {
        systemInstruction,
        temperature: 0.1,
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (!text || text.length < 100) {
       throw new Error("Contenu insuffisant trouvé.");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude JW";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Gestion intelligente du 429 (Rate Limit)
    if (error.message?.includes('429') && retryCount < 2) {
      console.log(`Rate limit atteint. Tentative ${retryCount + 1}...`);
      await sleep(2000 * (retryCount + 1)); // Attendre un peu
      return generateStudyContent(type, input, part, settings, retryCount + 1);
    }

    if (error.message?.includes('429')) {
      throw new Error("Le serveur Google est très sollicité. Réessayez dans 1 minute ou utilisez un lien direct.");
    }

    throw new Error(error.message || "Erreur de connexion aux serveurs de recherche.");
  }
};
