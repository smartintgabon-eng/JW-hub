
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

  // Création d'une nouvelle instance à chaque appel pour garantir la fraîcheur
  const ai = new GoogleGenAI({ apiKey });
  
  // Modèle flash pour une vitesse maximale et moins de limites de quota
  const modelName = 'gemini-3-flash-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      SOURCE : jw.org
      ARTICLE OU SUJET : "${input}"
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      TA MISSION :
      1. ANALYSE l'article et génère pour CHAQUE paragraphe :
         - Le numéro du paragraphe et sa question associée.
         - "Réponse (Points clés) :" Détails bibliques extraits.
         - "Commentaire :" Une réflexion personnelle et encourageante pour les réunions.
         - "Application :" Comment appliquer cela dans notre vie.
      2. RÉVISION : Réponds de manière concise à TOUTES les questions de révision à la fin.
      
      CONSIGNE CRITIQUE :
      - Pour CHAQUE verset cité, écris impérativement son texte COMPLET entre parenthèses.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      REUNION : Vie et Ministère
      SUJET : "${input}"
      SECTION : ${part === 'tout' ? 'Toutes les parties (Joyaux, Perles, Ministère, Vie Chrétienne)' : part}.
      BIBLE : Traduction du Monde Nouveau (TMN)

      INSTRUCTIONS :
      - Si c'est "Joyaux", donne les points forts.
      - Si c'est "Perles", donne au moins 5 perles spirituelles avec versets.
      - Si c'est "Étude biblique", donne les 6 leçons d'application habituelles.
      
      CONSIGNE CRITIQUE :
      - Écris le texte COMPLET des versets bibliques cités.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        // Désactivation de thinkingBudget pour éviter les délais inutiles sur ce type de tâche
        temperature: 0.8,
        topP: 0.95,
      },
    });

    if (!response.text) throw new Error("L'IA a retourné une réponse vide.");

    const text = response.text;
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error.message || "";
    
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("LIMITE ATTEINTE : Google demande d'attendre 60 secondes entre chaque étude gratuite. Merci de patienter un petit instant.");
    }
    
    throw new Error("L'IA est temporairement indisponible. Réessayez dans 30 secondes.");
  }
};
