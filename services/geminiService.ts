
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
  // Amélioration du prompt de recherche pour jw.org
  const searchQuery = isLink ? "" : `Recherche précisément sur jw.org l'article de ${type === 'WATCHTOWER' ? 'la Tour de Garde' : 'la réunion Vie et Ministère'} correspondant à la date ou au thème : "${input}".`;

  let prompt = "";
  const customPrefs = settings.answerPreferences ? `PREFERENCES UTILISATEUR SUPPLEMENTAIRES : ${settings.answerPreferences}` : "";

  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      ARTICLE SOURCE : ${isLink ? input : "Article trouvé via Google Search sur jw.org"}
      BIBLE : Traduction du Monde Nouveau (TMN)
      
      CONSIGNES STRICTES DE FORMATAGE :
      1. ANALYSE TOUS LES PARAGRAPHES SANS EXCEPTION.
      2. POUR CHAQUE PARAGRAPHE, FOURNIS :
         - "PARAGRAPHE [Numéro] : [Question complète]"
         - "VERSET À LIRE : (Écris ici le texte COMPLET du verset principal cité entre parenthèses)"
         - "RÉPONSE : Commence par 'D'après [cite le chapitre et verset]...', puis donne la réponse."
         - "COMMENTAIRE : [Propose un commentaire personnel et encourageant pour la réunion]"
         - "APPLICATION : [Comment appliquer ce point concrètement aujourd'hui]"
      3. RÉVISION : Réponds à TOUTES les questions de révision finales.

      ${customPrefs}
      STYLE : Élégant, spirituel et profond.
    `;
  } else {
    prompt = `
      TU ES UN EXPERT EN RECHERCHE BIBLIQUE POUR LES TÉMOINS DE JÉHOVAH.
      CAHIER SOURCE : ${isLink ? input : "Cahier de réunion trouvé via Google Search sur jw.org"}
      SECTION DEMANDÉE : ${part === 'tout' ? 'Toutes les parties' : part}
      
      MISSION :
      - Pour les perles spirituelles : Trouve 5 perles minimum. Chaque perle doit commencer par le VERSET COMPLET entre parenthèses.
      - Pour les exposés et discours : Propose une structure complète (Introduction, points clés, Conclusion) avec des versets lus.
      - Pour l'étude biblique de l'assemblée : Questions, versets complets, réponses et commentaires.
      - Utilise "D'après [chapitre/verset]..." pour introduire tes pensées.

      ${customPrefs}
      STYLE : Structuré, noble et basé exclusivement sur jw.org et la TMN.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: searchQuery ? `${searchQuery}\n\nUne fois l'article identifié, applique ce plan : ${prompt}` : prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 4000 },
        tools: isLink ? [] : [{ googleSearch: {} }] 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Aucun contenu généré.");
    
    const title = text.split('\n')[0].replace(/[#*]/g, '').trim() || "Étude Générée";
    return { text, title, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Impossible de générer l'étude. Vérifiez le lien ou la date.");
  }
};
