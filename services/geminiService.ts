
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Utilisation de Gemini 3 Pro pour assurer une logique parfaite et ne pas sauter de paragraphes
  const modelName = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      MISSION CRITIQUE : 
      1. ANALYSE l'intégralité de l'article SANS SAUTER AUCUN PARAGRAPHE. 
      2. SUIS l'ordre numérique exact (1, 2, 3...). 
      3. POUR CHAQUE PARAGRAPHE, FOURNIS :
         - "PARAGRAPHE [Numéro] : [Question de l'article]"
         - "VERSET À LIRE : [Cite le texte COMPLET du verset principal mentionné entre parenthèses]"
         - "RÉPONSE : [Donne une réponse précise basée uniquement sur le texte]"
         - "COMMENTAIRE : [Fournis une réflexion personnelle et encourageante pour la réunion]"
         - "APPLICATION : [Comment mettre ce point en pratique dans notre vie]"
      4. RÉVISION : Réponds à TOUTES les questions de révision à la fin de l'article.
      
      STYLE : Écriture élégante, respectueuse et profonde. Utilise des expressions comme "D'après tel chapitre et verset...".
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      SUJET : "${input}"
      SECTION : ${part === 'tout' ? 'Toutes les parties' : part}.
      
      INSTRUCTIONS :
      - Pour chaque partie, cite le verset COMPLET au début de la réponse entre parenthèses.
      - Utilise la Traduction du Monde Nouveau.
      - Donne des perles spirituelles (au moins 5), des propositions d'exposés structurés et des réponses pour l'étude biblique.
      - NE RÉUNIS PAS les paragraphes, traite chaque point distinctement.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 } // On veut une réponse directe et complète
      },
    });

    const text = response.text;
    if (!text) throw new Error("L'IA n'a pas pu générer de contenu.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || "Étude Générée";
    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("L'IA a rencontré un problème. Vérifiez votre connexion ou le lien jw.org.");
  }
};
