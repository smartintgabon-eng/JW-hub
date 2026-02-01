
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  // Accès sécurisé à la clé API pour éviter le crash au chargement
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
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      TA MISSION :
      1. TRAITE TOUS LES PARAGRAPHES de 1 jusqu'à la fin de l'article.
      2. POUR CHAQUE PARAGRAPHE, GÉNÈRE :
         - Le numéro du paragraphe et sa question.
         - "Réponse (Points clés) :" Informations directes du paragraphe.
         - "Commentaire :" Une analyse profonde et encourageante.
         - "Application :" Comment appliquer cela concrètement.
      3. RÉVISION : Réponds à TOUTES les questions de la boîte de révision finale.
      
      CONSIGNE BIBLIQUE :
      - Cite CHAQUE verset en entier entre parenthèses immédiatement après sa référence (ex: Jean 3:16 (Car Dieu a tant aimé...)).
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      ARTICLE : "${input}"
      SECTION : ${part === 'tout' ? 'Toutes les parties' : part}.
      BIBLE : Traduction du Monde Nouveau (TMN)

      IMPORTANT POUR L'ÉTUDE BIBLIQUE DE L'ASSEMBLÉE :
      Fournis obligatoirement les 6 leçons suivantes :
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

    if (!response.text) throw new Error("L'IA n'a retourné aucune réponse.");

    const text = response.text;
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Cahier de réunion');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      throw new Error("LIMITE ATTEINTE (429) : Vous avez épuisé votre quota gratuit pour aujourd'hui. Veuillez réessayer dans quelques heures ou utiliser une autre clé API.");
    }
    throw new Error("Erreur de l'IA : " + errorMsg);
  }
};
