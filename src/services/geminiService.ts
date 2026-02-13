import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types"; 

// Fix: setTimeout expects a function as its first argument
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve as TimerHandler, ms));

const cleanUrl = (url: string): string => {
  try {
    const trimmed = url.trim().replace(/[,.;]+$/, '');
    if (trimmed.startsWith('http')) {
      const u = new URL(trimmed);
      return u.toString();
    }
    return trimmed;
  } catch {
    return url.trim().replace(/[,.;]+$/, '');
  }
};

const getApplicationQuestions = () => `
- Quelle leçon pouvons-nous tirer pour nous?
- Quelle leçon pour la prédication?
- Quelle leçon pour la famille?
- Quelle leçon pour l'assemblée ou la salle du royaume?
- Quelle leçon sur Jéhovah et Jésus?
`;

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout', // Ajout de la partie d'étude
  settings: AppSettings,
  retryCount = 0,
  isInitialSearchForPreview = false // Nouvelle prop pour une recherche initiale légère
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Clé API absente. Vérifiez votre configuration.");

  const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  let modelToUse: string = 'gemini-3-flash-preview'; 
  let toolsConfig: any[] | undefined; 
  let systemInstruction = '';
  let temperature = 0.2; 
  let groundingInstruction = ''; // Declare groundingInstruction in a higher scope

  // Determine grounding instruction and tools config based on whether the input is a link or a search query
  if (!isLink) {
    toolsConfig = [{ googleSearch: {} }]; 
    groundingInstruction = `Vous avez effectué une recherche pour l'article "${input}" sur jw.org. Utilisez les résultats de recherche que vous avez trouvés pour extraire et analyser l'article. Soyez très fidèle et ne pas inventer d'informations. Si vous ne trouvez pas assez d'informations ou si les résultats sont ambigus, indiquez-le clairement.`;
  } else {
    toolsConfig = undefined; // No need for googleSearch for a direct link
    groundingInstruction = `Le contenu de l'article se trouve à l'URL suivante : "${input}". Vous devez agir comme si vous aviez lu l'intégralité de cette page web, y compris les références bibliques et les sous-liens. Extrayez toutes les informations pertinentes directement de ce contenu. Soyez très fidèle à toutes les informations trouvées et n'inventez rien.`;
  }

  if (type === 'WATCHTOWER') {
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'analyser l'article de la Tour de Garde.
    ${groundingInstruction}
    
    Subdivisez l'article de manière structurée et très détaillée. La réponse doit être **impérativement basée** et strictement fidèle aux publications officielles de jw.org et à la Bible Traduction du Monde Nouveau. Ne pas inventer d'informations. Priorise la clarté et la concision tout en étant exhaustif.
    
    Structure: 
    # [Titre de l'article] 
    Thème: [Thème de l'article] 
    
    PARAGRAPHE [N°]: 
    QUESTION: [Question du paragraphe]
    VERSET: (Inclure le texte complet du verset biblique entre parenthèses)
    RÉPONSE: (D'après le verset biblique et le paragraphe, inclure des détails et des explications en vous basant *directement* sur le contenu de l'article/page web ou des snippets de recherche.)
    COMMENTAIRE: (Un point d'approfondissement ou une idée supplémentaire pertinente tirée de l'article.)
    APPLICATION: (Comment appliquer personnellement cette information, en vous basant *directement* sur le contenu de l'article/page web ou des snippets de recherche.)
    
    Répéter ce format pour chaque paragraphe.
    
    À la fin de l'article, inclure toutes les QUESTIONS DE RÉVISION:
    QUESTION: [Question de révision]
    RÉPONSE: [Réponse détaillée basée sur le contenu de l'article/page web ou des snippets de recherche]
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else if (type === 'MINISTRY') {
    let partInstruction = '';
    // groundingInstruction is now correctly defined for MINISTRY type
    

    switch (part) {
      case 'joyaux_parole_dieu':
        partInstruction = `**JOYAUX DE LA PAROLE DE DIEU**
        Fournis une proposition d'exposé détaillée pour le discours principal de cette section, en te basant sur le contenu de l'article. L'exposé doit inclure:
        Thème: [Thème clair pour l'exposé, basé sur l'article]
        INTRODUCTION: [Une introduction engageante basée sur l'article]
        POINTS PRINCIPAUX:
        - [Point 1 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses) et des références aux publications officielles de jw.org (ex: wXX XX/X p.XX §X). Développe ce point en t'appuyant sur l'article.]
        - [Point 2 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses) et des références aux publications officielles de jw.org (ex: wXX XX/X p.XX §X). Développe ce point en t'appuyant sur l'article.]
        CONCLUSION: [Une conclusion pratique et encourageante basée sur l'article]
        `;
        break;
      case 'perles_spirituelles':
        partInstruction = `**PERLES SPIRITUELLES**
        Pour chaque perle spirituelle, en te basant sur le contenu de l'article et de ses références, suis le format suivant:
        VERSET: (Verset biblique complet entre parenthèses lié à la perle)
        QUESTION: [La première question de la perle spirituelle, textuellement de l'article]
        RÉPONSE: [Réponse détaillée basée sur la publication de référence ou l'article lui-même]
        COMMENTAIRE: [Point d'approfondissement ou idée supplémentaire tirée de l'article]
        APPLICATION: [Comment appliquer personnellement cette perle tirée de l'article]
        QUESTION: [La deuxième question sur les leçons à tirer de la lecture biblique de la semaine, textuellement de l'article]
        RÉPONSE: [Réponse détaillée sur les leçons personnelles, pour la prédication, etc., tirée de l'article]
        `;
        break;
      case 'applique_ministere':
        partInstruction = `**APPLIQUE-TOI AU MINISTÈRE**
        En te basant sur le contenu de l'article, liste tous les exposés proposés dans le programme de la semaine. Pour CHAQUE exposé, fournis une proposition détaillée:
        [Nom de l'exposé - Ex: Visite initiale]
        INTRODUCTION: [Une introduction adaptée, basée sur l'article]
        POINTS À DÉVELOPPER:
        - [Point 1 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses) et des références aux publications jw.org. Développe ce point en t'appuyant sur l'article.]
        - [Point 2 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses) et des références aux publications jw.org. Développe ce point en t'appuyant sur l'article.]
        CONCLUSION: [Une conclusion claire et encourageante, basée sur l'article]
        `;
        break;
      case 'vie_chretienne':
        partInstruction = `**VIE CHRÉTIENNE**
        En te basant sur le contenu de l'article (et en simulant l'analyse d'une vidéo si elle est mentionnée dans le texte), fournis des "RÉPONSES :" détaillées aux questions de discussion et des "POINTS DE DISCUSSION :" pratiques. Ces réponses et points doivent être basés sur les principes bibliques et les publications de jw.org mentionnées dans l'article.
        `;
        break;
      case 'etude_biblique_assemblee':
        partInstruction = `**ÉTUDE BIBLIQUE DE L'ASSEMBLÉE**
        En te basant sur le contenu de l'article (et les références de livre/brochure), fournis les "RÉPONSES :" détaillées aux questions de l'étude.
        `;
        // Ajoute les questions d'application SEULEMENT pour cette partie
        partInstruction += `\n\n${getApplicationQuestions()}`;
        break;
      case 'tout':
      default:
        partInstruction = `Fournis des réponses et exemples d'exposés détaillés pour **Toutes les parties** du Cahier, dans l'ordre suivant, en te basant sur le contenu de l'article principal et de ses références:
        
        **JOYAUX DE LA PAROLE DE DIEU**
        (Suit le format détaillé des Joyaux de la Parole de Dieu, y compris Thème, Introduction, Points principaux avec références bibliques complètes et Conclusion.)
        
        **PERLES SPIRITUELLES**
        (Suit le format détaillé des Perles Spirituelles, y compris Verset, Q1, R1, Commentaire, Application, Q2, R2.)
        
        **APPLIQUE-TOI AU MINISTÈRE**
        (Suit le format détaillé de Applique-toi au Ministère, listant tous les exposés avec Introduction, Points à développer et Conclusion pour chacun.)
        
        **VIE CHRÉTIENNE**
        (Suit le format détaillé de Vie Chrétienne, incluant Réponses aux questions et Points de discussion.)
        
        **ÉTUDE BIBLIQUE DE L'ASSEMBLÉE**
        (Suit le format détaillé de l'Étude Biblique de l'Assemblée, incluant les Réponses aux questions de l'étude.)
        ${getApplicationQuestions()}
        `;
        break;
    }

    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'analyser l'article du Cahier Vie et Ministère.
    ${groundingInstruction}
    
    Structure: 
    # [Titre de l'article du Cahier] 
    Thème: [Thème général de la semaine] 
    
    ${partInstruction}
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé. Élabore avec des points pertinents.'}. Réponds en Markdown.`;
    temperature = 0.2; 
  }

  // Si c'est une recherche initiale pour l'aperçu, on utilise un prompt plus court et moins exigeant.
  if (isInitialSearchForPreview) {
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'identifier le titre et le thème principal de l'article lié à "${input}" (qu'il soit un lien ou un sujet/date de Tour de Garde ou Cahier Vie et Ministère).
    ${groundingInstruction}
    Réponds uniquement avec le format suivant: # [Titre de l'article] \n Thème: [Thème de l'article]. Ne fournis aucun autre détail ou contenu de l'article.`;
  }

  try {
    // Si c'est un lien direct, le contenu est "l'URL" pour le modèle, même si nous ne le scrapons pas.
    // L'instruction système est ce qui le "grounde".
    const modelContent = isLink ? `Analyser le contenu de l'article à l'URL : ${cleanedInput}` : `Rechercher et analyser l'article pour le sujet/la date : ${input}`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: modelContent,
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig, 
      },
    });

    const text = response.text || "";
    
    if (!text || text.length < 50 || text.toLowerCase().includes('désolé') || text.toLowerCase().includes('impossible de trouver') || text.toLowerCase().includes('ne peut pas accéder à des sites web externes')) {
      throw new Error("MODEL_PROCESSING_ERROR");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Étude Biblique";
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return { text, title, theme };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorStr = JSON.stringify(error); 
    const status = error.status || (error.response && error.response.status); 

    // Specific API key/billing errors
    if (status === 401 || errorStr.includes('Unauthorized') || errorStr.includes('invalid API key')) {
        throw new Error("INVALID_API_KEY");
    }
    if (status === 403 || errorStr.includes('Forbidden') || errorStr.includes('billing')) {
        throw new Error("BILLING_REQUIRED");
    }

    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search') || errorStr.includes('not found');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        const wait = (retryCount + 1) * 20000;
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1, isInitialSearchForPreview);
      }
      throw new Error("COOLDOWN_REQUIRED");
    }

    if (isSearchToolError) {
      if (retryCount < 1 && !isLink) { // Réessayer une fois si c'est une recherche par date/thème
         const wait = 15000;
         await sleep(wait);
         return generateStudyContent(type, input, part, settings, retryCount + 1, isInitialSearchForPreview);
      }
      throw new Error("SEARCH_QUOTA_EXCEEDED");
    }
    
    if (error.message === "MODEL_PROCESSING_ERROR") {
        throw new Error("L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente.");
    }

    // Erreur générique avec le statut si disponible, pour le diagnostic.
    throw new Error(`GENERIC_API_ERROR: ${status || 'unknown'}`);
  }
};