
import { GoogleGenAI } from "@google/genai";
import { StudyPart } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  // Initialisation à l'intérieur de la fonction pour éviter les erreurs de chargement global
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      ARTICLE : "${input}"
      SOURCE : jw.org
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      INSTRUCTIONS CRUCIALES :
      1. Analyse l'article de la Tour de Garde indiqué.
      2. RÉPONDS À TOUS LES PARAGRAPHES de l'article, du paragraphe 1 jusqu'au dernier. Ne saute aucun paragraphe.
      3. Pour CHAQUE paragraphe :
         - Écris le numéro et la question.
         - "Réponse (Informations Clés) :" Extraits précis du paragraphe.
         - "Commentaire :" Une réflexion personnelle profonde et biblique.
         - "Application :" Comment appliquer ce point dans la vie chrétienne.
      4. QUESTIONS DE RÉVISION : À la fin, réponds obligatoirement à TOUTES les questions de la boîte de révision.
      
      RÈGLES DE CITATION :
      - Pour CHAQUE verset biblique mentionné (surtout ceux indiqués par "Lire"), inclus le texte COMPLET du verset entre parenthèses juste après sa référence.
      - Utilise des phrases comme "D'après [Livre Chapitre:Verset]...".
    `;
  } else {
    prompt = `
      ARTICLE : "${input}" (Cahier Vie et Ministère)
      SOURCE : jw.org
      BIBLE : Traduction du Monde Nouveau (TMN)
      SECTION : ${part === 'tout' ? 'Toutes les parties' : part}
      
      INSTRUCTIONS POUR L'ÉTUDE BIBLIQUE DE L'ASSEMBLÉE :
      Si l'article contient une étude biblique, tu dois OBLIGATOIREMENT fournir ces leçons pour chaque section étudiée :
      - Leçon pour nous personnellement.
      - Leçon pour la prédication.
      - Leçon pour la famille.
      - Leçon pour l'assemblée ou la salle du royaume.
      - Ce que cela nous apprend sur Jéhovah (Ses qualités, sa volonté).
      - Ce que cela nous apprend sur Jésus.
      
      INSTRUCTIONS POUR LES AUTRES PARTIES :
      - JOYAUX : Analyse détaillée du texte biblique avec perles spirituelles.
      - MINISTÈRE : Propositions complètes et variées pour les exposés.
      - VIE CHRÉTIENNE : Commentaires pour les besoins locaux et autres parties.
      
      FORMAT :
      - Inclus le texte COMPLET des versets entre parenthèses (TMN).
      - Langage professionnel, spirituel et profond.
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

    const text = response.text || "Désolé, impossible de générer le contenu.";
    const titleMatch = text.match(/^# (.*)/) || text.match(/(.*)\n===/);
    const title = titleMatch ? titleMatch[1].trim() : (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère');

    return { text, title, sources: [] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
