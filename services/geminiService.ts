
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
  
  // Utilisation systématique de Gemini 3 Pro pour la recherche web
  const modelName = 'gemini-3-pro-preview';
  
  const isLink = input.startsWith('http');
  
  // Instruction système très spécifique pour forcer l'usage du moteur de recherche sur jw.org
  const systemInstruction = `
    TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
    MISSION : Tu DOIS utiliser l'outil Google Search pour accéder au contenu de l'article sur jw.org.
    
    RÈGLES D'ANALYSE :
    1. Lis l'article entièrement.
    2. Liste TOUS les paragraphes dans l'ordre (1, 2, 3...). Ne saute rien.
    3. Pour chaque paragraphe : Donne la Question, le Verset à lire (texte complet), la Réponse basée sur le texte, un Commentaire pour la réunion, et une Application pratique.
    4. Utilise un ton noble et spirituel.
    
    ${settings.answerPreferences ? `CONSIGNES SPÉCIFIQUES : ${settings.answerPreferences}` : ''}
  `;

  const userPrompt = isLink 
    ? `Analyse cet article via ce lien direct : ${input}. Trouve le titre, le thème et génère l'étude complète paragraphe par paragraphe.`
    : `Cherche sur jw.org l'article pour la date/sujet suivant : ${input}. Identifie l'article officiel et génère l'étude complète.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 12000 },
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (!text || text.length < 100) {
      throw new Error("L'IA n'a pas renvoyé assez de contenu. Réessayez.");
    }

    const lines = text.split('\n');
    const title = lines[0].replace(/[#*]/g, '').trim() || "Étude Biblique";
    const themeLine = lines.find(l => l.toLowerCase().includes('thème') || l.toLowerCase().includes('titre'));
    const theme = themeLine ? themeLine.replace(/[#*]/g, '').trim() : "Article JW.ORG";

    return { text, title, theme };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    if (error.message?.includes('429')) throw new Error("Trop de requêtes. Attendez une minute.");
    throw new Error("Échec de la recherche sur jw.org. L'IA n'a pas pu accéder à la page. Vérifiez votre connexion ou le lien.");
  }
};
