
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  let apiKey = "";
  try {
    // @ts-ignore
    apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : "";
  } catch (e) {
    console.error("Clé API inaccessible");
  }
  
  if (!apiKey) {
    throw new Error("Clé API manquante. Veuillez configurer API_KEY dans vos variables d'environnement Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Utilisation de gemini-3-flash-preview qui a des limites de quota beaucoup plus élevées que le modèle Pro
  const model = 'gemini-3-flash-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      TA MISSION :
      1. TRAITE TOUS LES PARAGRAPHES de l'article sans exception.
      2. POUR CHAQUE PARAGRAPHE, GÉNÈRE :
         - Le numéro du paragraphe et sa question.
         - "Réponse (Points clés) :" Détails du paragraphe.
         - "Commentaire :" Une réflexion encourageante pour les réunions.
         - "Application :" Mise en pratique.
      3. RÉVISION : Réponds à TOUTES les questions de révision.
      
      CONSIGNE BIBLIQUE :
      - Écris le texte COMPLET des versets entre parenthèses après chaque référence.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      ARTICLE : "${input}"
      SECTION : ${part === 'tout' ? 'Toutes les parties' : part}.
      BIBLE : Traduction du Monde Nouveau (TMN)

      INSTRUCTION SPÉCIALE ÉTUDE BIBLIQUE :
      Si c'est l'étude biblique, tu dois obligatoirement fournir ces 6 leçons :
      - Leçon pour soi / Prédication / Famille / Assemblée / Qualités de Jéhovah / Exemple de Jésus.
      
      CONSIGNE BIBLIQUE :
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
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Tour de Garde' : 'Réunion Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    
    // Gestion explicite de l'erreur 429
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("LIMITE DE L'IA ATTEINTE : Google limite le nombre de recherches gratuites par minute. Veuillez patienter 1 ou 2 minutes avant de réessayer, cela refonctionnera tout seul.");
    }
    
    throw new Error("L'IA a rencontré un problème. Vérifiez le lien ou réessayez dans un instant.");
  }
};
