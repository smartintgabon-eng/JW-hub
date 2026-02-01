
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';
  
  const isLink = input.startsWith('http');
  // Utilisation systématique de googleSearch pour accéder au contenu dynamique de jw.org
  const query = isLink 
    ? `Utilise tes outils de recherche pour lire le contenu de ce lien jw.org : ${input}. Analyse ensuite chaque paragraphe dans l'ordre.`
    : `Cherche sur jw.org l'article pour : ${input}.`;

  const customInstructions = settings.answerPreferences 
    ? `\nPRÉFÉRENCES UTILISATEUR : ${settings.answerPreferences}`
    : "";

  const prompt = type === 'WATCHTOWER' ? `
    TU ES UN EXPERT BIBLIQUE DES TÉMOINS DE JÉHOVAH.
    MISSION : Génère l'étude complète en suivant STRICTEMENT l'ordre des paragraphes de l'article (1, 2, 1-2, 3, etc.).
    
    FORMAT PAR PARAGRAPHE :
    - PARAGRAPHE [Numéro] : [Question]
    - VERSET À LIRE : [Texte complet TMN]
    - RÉPONSE : D'après [verset], [réponse détaillée]
    - COMMENTAIRE : [Point spirituel profond]
    - APPLICATION : [Comment appliquer aujourd'hui]
    
    Termine par les questions de révision.
    ${customInstructions}
  ` : `
    TU ES UN EXPERT BIBLIQUE DES TÉMOINS DE JÉHOVAH.
    MISSION : Prépare la réunion Vie et Ministère pour : ${part}.
    Suit l'ordre du cahier de réunion.
    - JOYAUX : Analyse verset par verset.
    - PERLES : 5 perles minimum avec versets complets.
    - ÉTUDE : Questions/Réponses dans l'ordre.
    ${customInstructions}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${query}\n\n${prompt}`,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 8000 },
        tools: [{ googleSearch: {} }] // Toujours actif pour lire jw.org
      },
    });

    const text = response.text || "";
    if (!text || text.length < 50) throw new Error("L'IA n'a pas pu extraire le contenu. Vérifiez le lien.");

    const lines = text.split('\n');
    const title = lines[0].replace(/[#*]/g, '').trim();
    const theme = lines.find(l => l.toLowerCase().includes('thème') || l.toLowerCase().includes('article'))?.replace(/[#*]/g, '').trim();

    return { text, title, theme };
  } catch (error: any) {
    console.error("Search Error:", error);
    throw new Error("Impossible d'accéder à jw.org. Assurez-vous que le lien est correct et public.");
  }
};
