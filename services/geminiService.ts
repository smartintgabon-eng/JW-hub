
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
  
  // Modèle Pro pour une qualité maximale
  const modelName = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      MISSION : Analyse TOUT l'article sans sauter aucun paragraphe.
      STRUCTURE OBLIGATOIRE PAR PARAGRAPHE :
      1. "PARAGRAPHE [Numéro] : [Question complète]"
      2. "VERSET À LIRE : (Écris ici le texte COMPLET du verset principal cité entre parenthèses)"
      3. "RÉPONSE : D'après le texte, [Réponse détaillée]"
      4. "COMMENTAIRE : [Réflexion profonde pour la réunion]"
      5. "APPLICATION : [Comment l'appliquer concrètement]"
      
      FINIS TOUJOURS par la section "QUESTIONS DE RÉVISION" avec des réponses complètes.
      STYLE : Noble, encourageant, écriture soignée.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      SUJET : "${input}"
      SECTION : ${part === 'tout' ? 'Joyaux, Perles, Ministère, Vie Chrétienne, Étude' : part}.
      
      CONSIGNES :
      - Cite le texte BIBLIQUE COMPLET entre parenthèses au début de chaque point.
      - Ne regroupe pas les points, traite chaque perle et chaque partie séparément.
      - Fournis des réponses de qualité pour l'étude biblique de l'assemblée.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        // Correction de l'erreur Budget 0 : On laisse le modèle gérer son budget ou on met une valeur valide.
        thinkingConfig: { thinkingBudget: 4000 } 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || "Étude Préparée";
    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Erreur IA. Vérifiez votre connexion ou le lien jw.org.");
  }
};
