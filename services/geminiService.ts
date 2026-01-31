
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudyPart } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout'
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  const model = 'gemini-3-pro-preview';
  
  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      Cherche l'article de la Tour de Garde correspondant à : "${input}" sur jw.org.
      Utilise la Bible Traduction du Monde Nouveau (TMN).
      
      Format de réponse EXIGÉ pour chaque paragraphe :
      1. Numéro du paragraphe suivi de la question de l'article.
      2. "Réponses (Informations Clés) :" en italique, avec des tirets.
      3. "Commentaires :" avec des tirets, apportant une réflexion profonde.
      4. "Applications :" avec des tirets, montrant comment appliquer cela personnellement.
      
      Règles cruciales :
      - Pour chaque verset biblique mentionné au début d'une réponse ou d'un commentaire qui doit être lu, inclus le texte complet du verset entre parenthèses.
      - Commence souvent par "D'après tel chapitre et verset biblique...".
      - Utilise un ton professionnel et spirituel.
      - Si c'est un article d'étude, inclus la section "Leçons Pratiques : Réflexion Finale" à la fin.
    `;
  } else {
    prompt = `
      Cherche l'article du Cahier Vie et Ministère correspondant à : "${input}" sur jw.org.
      Partie demandée : ${part === 'tout' ? 'Toutes les parties' : part}.
      
      Détaille les sections suivantes si demandées :
      - JOYAUX DE LA PAROLE DE DIEU (Discours et Perles spirituelles)
      - APPLIQUE-TOI AU MINISTÈRE (Propositions d'exposés détaillés)
      - VIE CHRÉTIENNE (Commentaires pour les parties et Étude biblique de l'assemblée)
      
      Format :
      - Réponses claires et bibliques.
      - Commentaires profonds.
      - Applications concrètes.
      - Pour les discours, fournis un plan complet et rédigé.
      - Inclus les versets complets entre parenthèses pour les textes clés à lire.
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

    const text = response.text || "Désolé, je n'ai pas pu générer le contenu.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Attempt to extract title from text or grounding metadata
    const titleMatch = text.match(/^# (.*)/) || text.match(/(.*)\n===/);
    const title = titleMatch ? titleMatch[1].trim() : (type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère');

    return { text, title, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
