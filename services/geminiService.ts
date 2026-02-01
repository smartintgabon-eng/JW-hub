
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
  
  // On utilise Gemini 3 Flash pour la recherche (plus rapide, moins de quota 429)
  // Et on bascule sur Pro pour la génération finale
  const modelName = 'gemini-3-flash-preview';
  
  const isLink = input.startsWith('http');
  
  const systemInstruction = `
    TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
    MISSION : Utilise Google Search pour trouver et lire l'article sur jw.org.
    
    STRUCTURE DE L'ÉTUDE :
    - Identifie l'article par son titre exact.
    - Analyse chaque paragraphe (1, 2, 3...).
    - Pour chaque paragraphe : Question / Verset / Réponse / Commentaire / Application.
    
    ${settings.answerPreferences ? `PREFERENCES : ${settings.answerPreferences}` : ''}
  `;

  const query = isLink 
    ? `Analyse le contenu de ce lien : ${input}` 
    : `Trouve l'article jw.org pour : ${input}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (!text || text.length < 50) throw new Error("IA occupée ou contenu introuvable.");

    const lines = text.split('\n');
    const title = lines[0].replace(/[#*]/g, '').trim() || "Étude jw.org";
    const theme = lines.find(l => l.toLowerCase().includes('thème') || l.toLowerCase().includes('sujet'))?.replace(/[#*]/g, '').trim() || "";

    return { text, title, theme };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('429')) {
      throw new Error("L'IA est saturée. Attendez 30 secondes et réessayez.");
    }
    throw new Error("Erreur de connexion à jw.org. Vérifiez votre lien.");
  }
};
