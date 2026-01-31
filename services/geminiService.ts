
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  // Sécurité pour éviter l'écran noir sur Vercel/Browser
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : "";
  
  if (!apiKey) {
    throw new Error("Clé API manquante. Assurez-vous que l'environnement est correctement configuré.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      ARTICLE : "${input}"
      SOURCE : jw.org
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      INSTRUCTIONS :
      1. RÉPONDS À TOUS LES PARAGRAPHES DE L'ARTICLE (de 1 à la fin). Ne saute rien.
      2. Pour CHAQUE paragraphe :
         - Écris le numéro et la question.
         - "Réponse (Informations Clés) :" Informations directes du paragraphe.
         - "Commentaire :" Une réflexion personnelle encourageante et profonde.
         - "Application :" Comment appliquer cela concrètement.
      3. RÉVISION : Inclus TOUTES les questions de révision à la fin de l'article.
      
      RÈGLES BIBLE :
      - Cite TOUJOURS le texte complet des versets entre parenthèses juste après la référence (ex: Jean 3:16 (Car Dieu a tant aimé...)).
      - Utilise "D'après [Verset]..." pour commencer tes réponses.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      ARTICLE : "${input}" (Réunion Vie et Ministère)
      SOURCE : jw.org
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      INSTRUCTIONS SPÉCIFIQUES :
      Si c'est l'ÉTUDE BIBLIQUE DE L'ASSEMBLÉE, réponds aux questions et ajoute ces sections :
      - Leçon pour nous personnellement.
      - Leçon pour la prédication.
      - Leçon pour la famille.
      - Leçon pour l'assemblée ou la salle du royaume.
      - Ce que cela nous apprend sur Jéhovah.
      - Ce que cela nous apprend sur Jésus.
      
      Pour les autres sections (Joyaux, Ministère, Vie Chrétienne), donne des réponses complètes, des perles et des suggestions d'exposés.
      
      RÈGLES BIBLE :
      - Texte complet entre parenthèses pour CHAQUE verset.
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

    const text = response.text || "Erreur de génération.";
    const titleMatch = text.match(/^# (.*)/) || text.match(/(.*)\n===/);
    const title = titleMatch ? titleMatch[1].trim() : (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
