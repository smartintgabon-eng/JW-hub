import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { AppSettings, StudyPart, PredicationType } from "../types";

// Helper to get the API key
const getApiKey = () => {
  return (process.env as any).GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || "";
};

let genAI: any = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features may not work.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const generateContentFrontend = async (
  modelName: string,
  prompt: string,
  useSearch: boolean = true,
  useThinking: boolean = false
) => {
  const ai = getGenAI();
  const config: any = {};
  
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  if (useThinking && modelName.includes("pro")) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error: any) {
    console.error("Gemini Frontend Error:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("Quota d'IA épuisé (429). Veuillez patienter quelques minutes ou vérifier votre plan Gemini.");
    }
    throw error;
  }
};

export const performSearchFrontend = async (
  query: string,
  settings: AppSettings,
  confirmMode: boolean = false,
  contentOptions?: any
) => {
  const model = "gemini-3-flash-preview";
  
  if (confirmMode) {
    const metadataPrompt = `Extract from ${query}:
    1. Title
    2. Theme Bible Verse (if any)
    3. Brief Summary (1-2 sentences)
    4. Main Image URL
    
    Return ONLY a JSON object: {"title": "...", "themeVerse": "...", "summary": "...", "image": "..."}. 
    Use "https://assets.jw.org/assets/m/jwb/jwb_placeholder.png" if no image.`;

    const result = await generateContentFrontend(model, metadataPrompt, true);
    try {
      const jsonStr = result.text.replace(/```json\n?|\n?```/g, '').trim();
      const metadata = JSON.parse(jsonStr);
      return {
        previewTitle: metadata.title || "Article trouvé",
        previewSummary: metadata.summary || metadata.themeVerse || "Aperçu non disponible.",
        previewImage: metadata.image || "https://assets.jw.org/assets/m/jwb/jwb_placeholder.png",
        previewInfos: metadata.themeVerse ? `Verset Thème: ${metadata.themeVerse}` : `Source: jw.org`
      };
    } catch (e) {
      return {
        previewTitle: "Article trouvé",
        previewSummary: "Aperçu non disponible.",
        previewImage: "https://assets.jw.org/assets/m/jwb/jwb_placeholder.png",
        previewInfos: "Source: jw.org"
      };
    }
  } else {
    let contentInclusionInstructions = "";
    if (contentOptions) {
      if (contentOptions.includeArticles) contentInclusionInstructions += "Include references to other relevant articles from jw.org or wol.jw.org.\n";
      if (contentOptions.includeImages) contentInclusionInstructions += "Describe relevant images or visual aids.\n";
      if (contentOptions.includeVideos) contentInclusionInstructions += "Suggest relevant videos from jw.org.\n";
      if (contentOptions.includeVerses) contentInclusionInstructions += "Include key Bible verses (NWT).\n";
    }

    const prompt = `Answer based on Jehovah's Witnesses teachings: "${query}". 
    User Preferences: ${JSON.stringify(settings.answerPreferences || [])}
    ${contentInclusionInstructions}
    Use Google Search to find relevant info on jw.org or wol.jw.org. Format in Markdown.`;

    const result = await generateContentFrontend(model, prompt, true);
    return { text: result.text };
  }
};

export const generateStudyContentFrontend = async (
  view: string,
  input: string | string[],
  settings: AppSettings,
  contentOptions?: any,
  part: StudyPart = 'tout',
  preachingType?: PredicationType
) => {
  // Use Pro for full study, Flash for parts
  const model = part === 'tout' ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  const userPreferences = (settings.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';
  
  let type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' = 'WATCHTOWER';
  if (view === 'MINISTRY') type = 'MINISTRY';
  if (view === 'PREDICATION') type = 'PREDICATION';

  const contentString = Array.isArray(input) ? input.join('\n') : input;
  
  let prompt = `Analyze the following content and provide a structured explanation based on user preferences.\nContent/Context: "${contentString}"\nUser Preferences: ${userPreferences}\n
  IMPORTANT: Your response must be strictly based on the teachings found on jw.org and wol.jw.org. Use the Google Search tool to read the content of any URLs provided and verify information on these sites.`;
  
  if (type === 'WATCHTOWER') {
    prompt += `\nThis is a Watchtower study article. Format the response with a clear title, a summary, and a detailed, point-by-point explanation for each paragraph or section. Include the revision questions at the end and provide answers based on the article content.`;
  } else if (type === 'MINISTRY') {
    prompt += `\nThis is a Ministry Workbook meeting part (${part || 'full'}). Format the response appropriately for this specific part, providing practical points, scriptures, and clear explanations.`;
  } else if (type === 'PREDICATION') {
    prompt += `\nThis is a preparation for field ministry (${preachingType}). 
    Context: ${contentString}
    Provide a prepared presentation or discussion points suitable for this ministry type.
    Include:
    - An engaging opening question or remark.
    - A scripture to share and explain.
    - A transition to a publication or a follow-up question.
    - Practical tips for handling common objections if applicable.`;
  }

  const result = await generateContentFrontend(model, prompt, true, model.includes("pro"));
  
  let title = "Nouvelle Étude";
  const titleMatch = result.text.match(/^# (.*)/m);
  if (titleMatch) title = titleMatch[1];
  
  return {
    text: result.text,
    title,
    rawSources: []
  };
};

export const generateDiscourseContentFrontend = async (
  discoursType: string,
  time: string,
  theme: string,
  settings: AppSettings
) => {
  const model = "gemini-3.1-pro-preview";
  const userPreferences = (settings.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

  const prompt = `Tu es un orateur chrétien expérimenté (Témoin de Jéhovah). Prépare un plan détaillé pour un discours biblique.
  Type de discours : ${discoursType}
  Thème : "${theme}"
  Durée prévue : ${time}
  Préférences de l'utilisateur : ${userPreferences}
  
  Le discours doit inclure :
  1. Une introduction captivante.
  2. Un développement structuré avec des sous-thèmes clairs et des versets bibliques pertinents (Traduction du monde nouveau).
  3. Une conclusion motivante.
  Assure-toi que le contenu est adapté à la durée prévue (${time}) et strictement basé sur les enseignements bibliques des Témoins de Jéhovah.
  Use Google Search to find relevant info on jw.org or wol.jw.org. Format in Markdown.`;

  const result = await generateContentFrontend(model, prompt, true, true);
  
  return {
    text: result.text,
    title: theme,
    rawSources: []
  };
};

export const generateDiscourseThemeFrontend = async (
  input: string
) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Génère un thème de discours biblique accrocheur et profond basé sur les publications des Témoins de Jéhovah.
  Critères de l'utilisateur (optionnel) : "${input || 'Aucun critère spécifique'}".
  Le thème doit être court (moins de 10 mots), percutant, et adapté à un public chrétien.
  Ne renvoie QUE le thème, sans guillemets ni texte supplémentaire.`;

  const result = await generateContentFrontend(model, prompt, true);
  return result.text.trim();
};
