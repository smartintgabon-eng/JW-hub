
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
  
  // Utilisation de Gemini 3 Pro pour une réflexion profonde et sans oubli
  const modelName = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE OU SUJET : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      CONSIGNES CRITIQUES DE STRUCTURE :
      - NE SAUTE AUCUN PARAGRAPHE. Commence au paragraphe 1 et finis au dernier paragraphe de l'article.
      - TRAITE chaque paragraphe INDIVIDUELLEMENT (ne les regroupe pas).
      - FOURNIS pour chaque paragraphe :
        1. "PARAGRAPHE [Numéro] : [Question complète de l'article]"
        2. "VERSET À LIRE : (Écris ici le texte COMPLET du verset principal cité dans le paragraphe entre parenthèses)"
        3. "RÉPONSE : D'après le texte, [Réponse détaillée et biblique]"
        4. "COMMENTAIRE : [Une réflexion personnelle profonde pour lever la main à la réunion]"
        5. "APPLICATION : [Comment appliquer ce point concrètement]"
      - FINIS obligatoirement par la section "QUESTIONS DE RÉVISION" avec les réponses complètes à chaque question de révision à la fin de l'article.

      STYLE : Utilise un langage spirituel, noble et encourageant. Sois précis et complet.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      SUJET OU LIEN : "${input}"
      SECTION : ${part === 'tout' ? 'Toutes les parties (Joyaux, Perles, Ministère, Vie Chrétienne, Étude Biblique)' : part}.
      BIBLE : Traduction du Monde Nouveau (TMN)

      INSTRUCTIONS :
      - NE RÉUNIS PAS LES POINTS.
      - Pour chaque perle ou point, cite le texte BIBLIQUE COMPLET entre parenthèses au début de ta réponse.
      - Pour l'étude biblique, fournis les paragraphes, questions et réponses comme pour la Tour de Garde.
      - Pour les exposés, propose une introduction, un corps et une conclusion avec des versets lus.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        // Supprimé thinkingBudget: 0 qui causait l'erreur 400. 
        // Le modèle utilisera son budget par défaut pour garantir la qualité.
        thinkingConfig: { thinkingBudget: 4000 } 
      },
    });

    const text = response.text;
    if (!text) throw new Error("L'IA n'a pas pu générer de contenu.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.status === "INVALID_ARGUMENT") {
      throw new Error("Erreur de configuration de l'IA. Merci de réessayer, le système se réinitialise.");
    }
    throw new Error("L'IA est occupée ou le lien est incorrect. Attendez 30 secondes.");
  }
};
