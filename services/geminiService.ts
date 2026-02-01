
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';
  
  const isLink = input.startsWith('http');
  const searchQuery = isLink ? "" : `Identifie précisément l'article jw.org pour : ${input}.`;

  const customInstructions = settings.answerPreferences 
    ? `\nINSTRUCTIONS PERSONNELLES : ${settings.answerPreferences}`
    : "";

  let prompt = "";
  if (type === 'WATCHTOWER') {
    prompt = `
      TU ES UN EXPERT BIBLIQUE. SOURCE : jw.org. 
      ORDRE CHRONOLOGIQUE STRICT : Analyse l'article paragraphe par paragraphe (1, 2, 3, etc. ou 1-2, 3...). 
      NE SAUTE AUCUN NUMÉRO.
      
      FORMAT POUR CHAQUE SECTION :
      - "PARAGRAPHE [Numéro(s)] : [Question exacte]"
      - "VERSET À LIRE : [Texte complet du verset principal]"
      - "RÉPONSE : D'après [verset], [réponse précise]"
      - "COMMENTAIRE : [Pensée encourageante]"
      - "APPLICATION : [Mise en pratique]"
      
      ${customInstructions}
    `;
  } else {
    prompt = `
      TU ES UN EXPERT BIBLIQUE. SOURCE : jw.org.
      PRÉPARE LA RÉUNION VIE ET MINISTÈRE : ${part}.
      RESTE FIDELE AU CAHIER DE RÉUNION.
      - JOYAUX : Analyse profonde.
      - PERLES : 5 minimum avec versets complets.
      - ÉTUDE : Questions/Réponses dans l'ordre de l'article de l'étude.
      ${customInstructions}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: searchQuery ? `${searchQuery}\n\nGénère maintenant l'étude complète en suivant l'ordre de l'article : ${prompt}` : prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4000 },
        tools: isLink ? [] : [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    const lines = text.split('\n');
    const title = lines[0].replace(/[#*]/g, '').trim();
    const theme = lines.length > 2 ? lines[1].replace(/[#*]/g, '').trim() : "";

    return { text, title, theme };
  } catch (error) {
    throw new Error("Erreur lors de la recherche sur jw.org.");
  }
};
