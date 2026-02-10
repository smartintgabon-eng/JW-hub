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
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API absente. Vérifiez votre configuration.");

  // Always use `const ai = new GoogleGenAI({apiKey: process.env.API_KEY});` as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  let modelToUse: string;
  let toolsConfig: any[] | undefined; 

  // Use 'gemini-3-flash-preview' for text tasks, as per guidelines.
  modelToUse = 'gemini-3-flash-preview'; 

  if (isLink) {
    toolsConfig = undefined; 
  } else {
    // Add tool configuration for Google Search grounding, as per guidelines.
    toolsConfig = [{ googleSearch: {} }]; 
  }

  let systemInstruction = '';
  let temperature = 0.2; 

  if (type === 'WATCHTOWER') {
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'extraire et d'analyser l'article de la Tour de Garde à partir du ${isLink ? "lien" : "sujet/date"} "${input}", puis de le subdiviser de manière structurée et très détaillée.
    La réponse doit être **impérativement basée** et strictement fidèle aux publications officielles de jw.org et à la Bible Traduction du Monde Nouveau. Ne pas inventer d'informations. Priorise la clarté et la concision tout en étant exhaustif.
    Structure: 
    # [Titre de l'article] 
    Thème: [Thème de l'article] 
    
    PARAGRAPHE [N°]: 
    QUESTION: [Question du paragraphe]
    VERSET: (Inclure le texte complet du verset biblique entre parenthèses)
    RÉPONSE: (D'après le verset biblique et le paragraphe, inclure des détails et des explications)
    COMMENTAIRE: (Un point d'approfondissement ou une idée supplémentaire pertinente)
    APPLICATION: (Comment appliquer personnellement cette information)
    
    Répéter ce format pour chaque paragraphe.
    
    À la fin de l'article, inclure toutes les QUESTIONS DE RÉVISION:
    QUESTION: [Question de révision]
    RÉPONSE: [Réponse détaillée basée sur le contenu de l'article]
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else if (type === 'MINISTRY') {
    let partInstruction = '';
    switch (part) {
      case 'joyaux_parole_dieu':
        partInstruction = `**JOYAUX DE LA PAROLE DE DIEU**
        Fournis une proposition d'exposé détaillée pour le discours principal de cette section. L'exposé doit inclure:
        Thème: [Thème clair pour l'exposé]
        INTRODUCTION: [Une introduction engageante]
        POINTS PRINCIPAUX:
        - [Point 1 avec des références bibliques complètes (avec le texte complet du verset entre parenthèses) et des références aux publications officielles de jw.org. Développe ce point.]
        - [Point 2 avec des références bibliques complètes (avec le texte complet du verset entre parenthèses) et des références aux publications officielles de jw.org. Développe ce point.]
        CONCLUSION: [Une conclusion pratique et encourageante]
        `;
        break;
      case 'perles_spirituelles':
        partInstruction = `**PERLES SPIRITUELLES**
        Pour chaque perle spirituelle, suis le format suivant:
        VERSET: (Verset biblique complet entre parenthèses lié à la perle)
        QUESTION: [La première question de la perle spirituelle]
        RÉPONSE: [Réponse détaillée basée sur la publication de référence]
        COMMENTAIRE: [Point d'approfondissement ou idée supplémentaire]
        APPLICATION: [Comment appliquer personnellement cette perle]
        QUESTION: [La deuxième question sur les leçons à tirer de la lecture biblique de la semaine]
        RÉPONSE: [Réponse détaillée sur les leçons personnelles, pour la prédication, etc.]
        `;
        break;
      case 'applique_ministere':
        partInstruction = `**APPLIQUE-TOI AU MINISTÈRE**
        Liste tous les exposés proposés dans le programme de la semaine. Pour CHAQUE exposé, fournis une proposition détaillée:
        [Nom de l'exposé - Ex: Visite initiale]
        INTRODUCTION: [Une introduction adaptée]
        POINTS À DÉVELOPPER:
        - [Point 1 avec des références bibliques complètes (avec le texte complet du verset entre parenthèses) et des références aux publications jw.org. Développe ce point.]
        - [Point 2 avec des références bibliques complètes (avec le texte complet du verset entre parenthèses) et des références aux publications jw.org. Développe ce point.]
        CONCLUSION: [Une conclusion claire et encourageante]
        `;
        break;
      case 'vie_chretienne':
        partInstruction = `**VIE CHRÉTIENNE**
        Analyse le texte de l'article (priorise le texte si une vidéo est mentionnée mais non analysable directement). Fournis des "RÉPONSES :" détaillées aux questions de discussion et des "POINTS DE DISCUSSION :" pratiques, basés sur les principes bibliques et les publications de jw.org.
        `;
        break;
      case 'etude_biblique_assemblee':
        partInstruction = `**ÉTUDE BIBLIQUE DE L'ASSEMBLÉE**
        Fournis les "RÉPONSES :" détaillées aux questions de l'étude (livre ou brochure), en te basant sur le texte de la publication en référence.
        `;
        break;
      case 'tout':
      default:
        partInstruction = `Fournis des réponses et exemples d'exposés détaillés pour **Toutes les parties** du Cahier, dans l'ordre suivant:
        - Joyaux de la Parole de Dieu
        - Perles Spirituelles
        - Applique-toi au Ministère
        - Vie Chrétienne
        - Étude Biblique de l'Assemblée
        
        Pour chaque section, suis le formatage spécifique et détaillé demandé pour cette partie.
        `;
        break;
    }

    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'extraire et d'analyser l'article du Cahier Vie et Ministère à partir du ${isLink ? "lien" : "sujet/date"} "${input}".
    La réponse doit être **impérativement basée** et strictement fidèle aux publications officielles de jw.org et à la Bible Traduction du Monde Nouveau, en utilisant une réflexion biblique approfondie. Ne pas inventer d'informations.
    Structure: 
    # [Titre de l'article du Cahier] 
    Thème: [Thème général de la semaine] 
    
    ${partInstruction}
    
    Ajoute ces questions d'application **à la fin de CHAQUE leçon/section** (Joyaux, Perles, Applique-toi, Vie Chrétienne, Étude Biblique de l'Assemblée, même si "tout" est choisi) :
    ${getApplicationQuestions()}
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé. Élabore avec des points pertinents.'}. Réponds en Markdown.`;
    temperature = 0.2; 
  }

  // Si c'est une recherche initiale pour l'aperçu, on utilise un prompt plus court et moins exigeant.
  if (isInitialSearchForPreview) {
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'identifier le titre et le thème principal de l'article lié à "${input}" (qu'il soit un lien ou un sujet/date de Tour de Garde ou Cahier Vie et Ministère).
    Réponds uniquement avec le format suivant: # [Titre de l'article] \n Thème: [Thème de l'article]. Ne fournis aucun autre détail ou contenu de l'article.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: `Traiter l'article pour: ${type} ${input}`,
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig, 
      },
    });

    // Correct way to extract text output from GenerateContentResponse
    const text = response.text || "";
    
    if (!text || text.length < 50 || text.toLowerCase().includes('désolé') || text.toLowerCase().includes('impossible de trouver')) {
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
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        const wait = (retryCount + 1) * 20000;
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1, isInitialSearchForPreview);
      }
      throw new Error("COOLDOWN_REQUIRED");
    }

    if (isSearchToolError) {
      if (retryCount < 1 && !isLink) {
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