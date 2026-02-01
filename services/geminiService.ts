
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
  const modelName = 'gemini-3-pro-preview';
  
  // Si l'entrée n'est pas un lien, on demande à l'IA de chercher sur jw.org
  const isLink = input.startsWith('http');
  const searchQuery = isLink ? "" : `Trouve l'article ${type === 'WATCHTOWER' ? 'd\'étude de la Tour de Garde' : 'du cahier Vie et Ministère'} sur jw.org pour : ${input}`;

  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE DES TÉMOINS DE JÉHOVAH.
      ARTICLE : ${isLink ? input : "Celui trouvé via la recherche"}
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      INSTRUCTIONS STRICTES :
      1. ANALYSE TOUT L'ARTICLE PARAGRAPHE PAR PARAGRAPHE SANS EN SAUTER UN SEUL.
      2. POUR CHAQUE PARAGRAPHE :
         - "PARAGRAPHE [Numéro] : [Question de l'article]"
         - "VERSET À LIRE : (Écris ici le texte COMPLET du verset principal mentionné entre parenthèses avant de répondre)"
         - "RÉPONSE : D'après [cite le chapitre et verset], [donne la réponse précise]"
         - "COMMENTAIRE : [Fournis un commentaire profond et personnel pour la réunion]"
         - "APPLICATION : [Comment appliquer ce point aujourd'hui]"
      3. RÉVISION : Réponds aux questions de révision à la fin.
      
      STYLE : Noble, spirituel, professionnel.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE DES TÉMOINS DE JÉHOVAH.
      CAHIER : ${isLink ? input : "Celui trouvé via la recherche"}
      SECTION : ${part}
      
      MISSION :
      - Pour les perles spirituelles : Trouve au moins 5 perles. Pour chaque perle, écris le VERSET COMPLET entre parenthèses au début.
      - Pour les exposés/discours : Propose une structure complète (Intro, points, conclusion) avec les versets à lire.
      - Pour l'étude biblique : Questions, réponses, versets complets et commentaires.
      - Utilise toujours la TMN et jw.org.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: searchQuery ? `${searchQuery}\n\nEnsuite : ${prompt}` : prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 4000 },
        tools: isLink ? [] : [{ googleSearch: {} }] // Active la recherche si ce n'est pas un lien
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || "Étude Préparée";
    return { text, title, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("L'IA n'a pas pu accéder à jw.org ou traiter l'article. Vérifiez le lien.");
  }
};
