
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  // Utilisation sécurisée de la clé API
  let apiKey = "";
  try {
    apiKey = process.env.API_KEY || "";
  } catch (e) {
    console.error("Erreur d'accès à la clé API:", e);
  }
  
  if (!apiKey) {
    throw new Error("Configuration API incomplète. Veuillez configurer votre clé dans l'environnement.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      TA MISSION : Préparer une étude COMPLÈTE de l'article de la Tour de Garde suivant : "${input}".
      
      EXIGENCES ABSOLUES :
      1. TRAITE TOUS LES PARAGRAPHES : Tu ne dois sauter aucun paragraphe, du numéro 1 jusqu'à la fin de l'article.
      2. POUR CHAQUE PARAGRAPHE, FOURNIS :
         - Le numéro et la question exacte.
         - "Réponse (Informations Clés) :" Extraits et points essentiels du paragraphe.
         - "Commentaire :" Une réflexion profonde avec tes propres mots, s'appuyant sur la Bible.
         - "Application :" Comment mettre ce point en pratique aujourd'hui.
      3. QUESTIONS DE RÉVISION : À la fin de ton analyse, inclus obligatoirement la section "Questions de Révision" avec les réponses détaillées pour chaque question de la boîte de révision.
      
      CONSIGNES BIBLIQUES :
      - Utilise la Traduction du Monde Nouveau (TMN).
      - CHAQUE verset cité doit être écrit EN ENTIER entre parenthèses juste après sa référence (ex: Jean 3:16 (Car Dieu a tant aimé...)).
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      TA MISSION : Préparer la réunion Vie et Ministère pour : "${input}".
      SECTION DEMANDÉE : ${part === 'tout' ? 'Toutes les sections' : part}.

      INSTRUCTIONS POUR L'ÉTUDE BIBLIQUE DE L'ASSEMBLÉE :
      Si l'article contient l'étude biblique de l'assemblée, tu dois OBLIGATOIREMENT répondre aux questions ET fournir ces 6 leçons spécifiques :
      1. Leçon pour nous personnellement (étude, conduite).
      2. Leçon pour la prédication (arguments, attitude).
      3. Leçon pour la famille (culte familial, relations).
      4. Leçon pour l'assemblée ou la salle du royaume (encouragement, ordre).
      5. Ce que cela nous apprend sur JÉHOVAH (Ses qualités, Sa souveraineté).
      6. Ce que cela nous apprend sur JÉSUS (Son exemple, son rôle).

      AUTRES SECTIONS (Joyaux et Ministère) :
      - Fournis des perles spirituelles profondes avec le texte des versets COMPLET entre parenthèses.
      - Donne des suggestions pratiques pour les exposés du ministère.
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

    const text = response.text || "Erreur : L'IA n'a pas retourné de texte. Vérifiez votre lien ou réessayez.";
    
    // Extraction intelligente du titre
    const lines = text.split('\n');
    let title = type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère';
    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('**') || line.length > 5) {
        title = line.replace(/[#*]/g, '').trim();
        break;
      }
    }

    return { text, title, sources: [] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
