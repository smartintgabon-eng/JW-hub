
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey) {
    throw new Error("Clé API manquante. L'administrateur doit configurer API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Utilisation de gemini-3-flash-preview pour sa rapidité extrême
  const modelName = 'gemini-3-flash-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      ARTICLE : "${input}"
      MISSION : Analyse cet article paragraphe par paragraphe.
      POUR CHAQUE PARAGRAPHE :
      1. Numéro du paragraphe et sa question.
      2. Réponse précise basée sur l'article.
      3. Un commentaire personnel encourageant pour la réunion.
      4. Une application pratique.
      RÉVISION : Réponds aux questions de révision à la fin.
      IMPORTANT : Écris les versets cités EN ENTIER entre parenthèses.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      SUJET : "${input}"
      SECTION : ${part === 'tout' ? 'Joyaux, Perles, Ministère, Vie Chrétienne' : part}.
      MISSION : Donne des points forts, au moins 5 perles spirituelles et des applications pour le ministère.
      IMPORTANT : Écris les versets cités EN ENTIER entre parenthèses.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        // Paramètres optimisés pour la vitesse (pas de thinkingBudget)
        temperature: 0.7,
        topP: 0.9,
      },
    });

    if (!response.text) throw new Error("Réponse vide de l'IA.");

    const text = response.text;
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Étude Tour de Garde' : 'Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("LIMITE ATTEINTE : Trop de demandes. Attendez 60 secondes et réessayez.");
    }
    throw new Error("Erreur de connexion avec l'IA. Vérifiez votre lien ou réessayez.");
  }
};
