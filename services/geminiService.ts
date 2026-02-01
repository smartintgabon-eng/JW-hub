
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  // Protection contre le crash 'process is not defined' sur navigateur
  let apiKey = "";
  try {
    // @ts-ignore
    apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : "";
  } catch (e) {
    console.error("Erreur d'accès à la clé API");
  }
  
  if (!apiKey) {
    throw new Error("Clé API non trouvée. Veuillez configurer API_KEY dans Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      ARTICLE : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      INSTRUCTIONS :
      1. TRAITE CHAQUE PARAGRAPHE SANS EXCEPTION, de 1 à la fin.
      2. POUR CHAQUE PARAGRAPHE :
         - Numéro et Question exacte.
         - "Réponse (Points clés) :" Détails du paragraphe.
         - "Commentaire :" Analyse profonde et biblique.
         - "Application :" Mise en pratique concrète.
      3. RÉVISION : Réponds à TOUTES les questions de révision à la fin.
      
      RÈGLES BIBLE :
      - Écris le texte COMPLET des versets entre parenthèses juste après leur référence.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      ARTICLE : "${input}" (Réunion Vie et Ministère)
      SECTION : ${part === 'tout' ? 'Toutes les parties' : part}.

      IMPORTANT POUR L'ÉTUDE BIBLIQUE :
      Si c'est l'étude biblique, fournis OBLIGATOIREMENT ces 6 leçons :
      - Leçon pour soi / Leçon pour la prédication / Leçon pour la famille / Leçon pour l'assemblée / Sur Jéhovah / Sur Jésus.
      
      RÈGLES BIBLE :
      - Texte COMPLET des versets entre parenthèses.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    if (!response.text) throw new Error("Réponse vide de l'IA.");

    const text = response.text;
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier de réunion');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("QUOTA ÉPUISÉ : Vous avez atteint la limite gratuite de votre clé API Gemini. Veuillez réessayer plus tard ou utiliser une autre clé.");
    }
    throw error;
  }
};
