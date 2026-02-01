
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings
): Promise<{ text: string; title: string; sources: any[] }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';
  
  const isLink = input.startsWith('http');
  
  // Amélioration de la requête de recherche pour garantir que l'IA trouve l'article sur jw.org
  const searchQuery = isLink ? "" : `Cherche sur jw.org l'article officiel pour : ${type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère'} correspondant à "${input}". Identifie le titre exact et le contenu avant de générer les réponses.`;

  let prompt = "";
  // Inclusion des préférences utilisateur
  const customInstructions = settings.answerPreferences 
    ? `\nCONSIGNES DE PERSONNALISATION DE L'UTILISATEUR : ${settings.answerPreferences}`
    : "";

  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH. 
      BIBLE : Traduction du Monde Nouveau (TMN).
      SOURCE : jw.org.
      
      MISSION :
      1. Analyse l'article ${isLink ? input : 'trouvé'}.
      2. Pour CHAQUE paragraphe (ne saute aucun paragraphe), suis ce format :
         - "PARAGRAPHE [Numéro] : [Question de l'article]"
         - "VERSET À LIRE : (Texte COMPLET du verset cité entre parenthèses)"
         - "RÉPONSE : Commence par 'D'après [chapitre:verset]...', puis donne la réponse basée sur l'article."
         - "COMMENTAIRE : Propose un commentaire pour la réunion."
         - "APPLICATION : Comment appliquer ce point concrètement."
      3. Réponds aux "QUESTIONS DE RÉVISION" à la fin.
      ${customInstructions}
      
      STYLE : Noble, spirituel et respectueux.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      CAHIER : Vie et Ministère (${isLink ? input : 'recherche par date'}).
      SECTION : ${part === 'tout' ? 'Tout le cahier' : part}.
      
      MISSION :
      - Perles Spirituelles : Trouve 5 perles. Cite le VERSET COMPLET entre parenthèses au début de chaque point.
      - Exposés/Discours : Structure complète (Intro, corps, conclusion) avec versets.
      - Étude Biblique : Questions, versets complets, réponses détaillées et commentaires.
      - Utilise "D'après [chapitre:verset]..." pour introduire tes pensées.
      ${customInstructions}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: searchQuery ? `${searchQuery}\n\nUne fois identifié, prépare l'étude : ${prompt}` : prompt,
      config: {
        temperature: 0.75,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 4000 },
        tools: isLink ? [] : [{ googleSearch: {} }] 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || "Étude Préparée";
    return { text, title, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("L'IA n'a pas pu trouver l'article. Essayez avec un lien direct jw.org.");
  }
};
