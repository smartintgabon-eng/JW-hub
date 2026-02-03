
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types"; 

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  retryCount = 0
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API absente. Vérifiez votre configuration.");

  const ai = new GoogleGenAI({ apiKey });
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  let modelToUse: string;
  let toolsConfig: any[] | undefined; // Définir explicitement le type pour tools

  // Utiliser gemini-3-flash-preview pour toutes les tâches nécessitant la recherche ou une bonne compréhension textuelle.
  // Ce modèle supporte `googleSearch` et est performant pour le texte.
  modelToUse = 'gemini-3-flash-preview'; 

  if (isLink) {
    // Si c'est un lien, pas besoin de googleSearch pour "trouver" l'article, juste l'analyser.
    toolsConfig = undefined; 
  } else {
    // Si c'est une recherche par date/thème, on a besoin de googleSearch.
    toolsConfig = [{ googleSearch: {} }]; 
  }

  let systemInstruction = '';
  let temperature = 0.2; // Légèrement augmenté pour plus de fluidité sans sacrifier la fidélité

  if (type === 'WATCHTOWER') {
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'extraire et d'analyser l'article de la Tour de Garde à partir du ${isLink ? "lien" : "sujet/date"} "${input}", puis de le subdiviser de manière structurée et très détaillée.
    La réponse doit être **impérativement basée** et strictement fidèle aux publications officielles de jw.org et à la Bible Traduction du Monde Nouveau. Ne pas inventer d'informations. Priorise la clarté et la concision tout en étant exhaustif.
    Structure: # [Titre de l'article] \n Thème: [Thème de l'article] \n PARAGRAPHE [N°]: Question, Verset (inclure le texte complet du verset entre parenthèses), Réponse (d'après le verset biblique et le paragraphe), Commentaire, Application. 
    À la fin de l'article, inclure toutes les QUESTIONS DE RÉVISION: Question, Réponse (basées sur le contenu de l'article).
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else if (type === 'MINISTRY') {
    let partInstruction = '';
    switch (part) {
      case 'perles_spirituelles':
        partInstruction = `Concentre-toi uniquement sur la section "Perles Spirituelles" de l'article.
        Structure: Lis le verset clé (inclure le texte complet entre parenthèses), puis réponds à la première question en t'appuyant sur une publication de référence. Ensuite, réponds à la deuxième question en tirant des leçons de la lecture biblique de la semaine.
        À la fin de cette section, inclure les questions d'application suivantes : ${getApplicationQuestions()}`;
        break;
      case 'joyaux_parole_dieu':
        partInstruction = `Concentre-toi uniquement sur la section "Joyaux de la Parole de Dieu". Fournis une proposition d'exposé détaillée, incluant un thème, des points principaux, des références bibliques (avec le texte complet du verset entre parenthèses) et des références aux publications officielles de jw.org. L'exposé doit être pratique et encourageant.
        À la fin de cette section, inclure les questions d'application suivantes : ${getApplicationQuestions()}`;
        break;
      case 'applique_ministere':
        // Pour "Applique-toi au Ministère", l'IA devra d'abord lister les exposés, puis le user choisira.
        // Pour l'instant, je vais demander à l'IA de lister tous les exposés puis de donner une proposition pour chacun.
        // Une interaction plus complexe (choix utilisateur en plusieurs étapes) est hors de portée du `generateContent` direct.
        partInstruction = `Concentre-toi uniquement sur la section "Applique-toi au Ministère". Liste tous les exposés proposés dans le programme de la semaine. Pour chaque exposé, fournis une proposition d'introduction, des points à développer (avec références bibliques complètes et publications de jw.org), et une conclusion. Prépare-le comme si l'utilisateur avait choisi tous les exposés.
        À la fin de chaque proposition d'exposé, inclure les questions d'application suivantes : ${getApplicationQuestions()}`;
        break;
      case 'vie_chretienne':
        partInstruction = `Concentre-toi uniquement sur la section "Vie Chrétienne". Analyse le texte de l'article (ignorer les mentions de vidéo si le contenu n'est pas vidéo) et les questions associées. Fournis des réponses détaillées aux questions et des points de discussion pratiques, basés sur les principes bibliques et les publications de jw.org.
        À la fin de cette section, inclure les questions d'application suivantes : ${getApplicationQuestions()}`;
        break;
      case 'etude_biblique_assemblee':
        partInstruction = `Concentre-toi uniquement sur la section "Étude Biblique de l'Assemblée" (étude de livre ou brochure). Fournis les réponses aux questions de l'étude de manière concise et biblique, en te basant sur le texte de la publication en référence.
        À la fin de cette section, inclure les questions d'application suivantes : ${getApplicationQuestions()}`;
        break;
      case 'tout':
      default:
        partInstruction = `Fournis des réponses et exemples d'exposés détaillés pour **Toutes les parties** du Cahier : "Joyaux de la Parole de Dieu", "Perles Spirituelles", "Applique-toi au Ministère", "Vie Chrétienne" et "Étude Biblique de l'Assemblée". Pour chaque section, suis les instructions de formatage spécifiques à cette section.
        À la fin de CHAQUE leçon/section, ajoute ces questions d'application: ${getApplicationQuestions()}`;
        break;
    }

    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'extraire et d'analyser l'article du Cahier Vie et Ministère à partir du ${isLink ? "lien" : "sujet/date"} "${input}". ${partInstruction}
    La réponse doit être **impérativement basée** et strictement fidèle aux publications officielles de jw.org et à la Bible Traduction du Monde Nouveau, en utilisant une réflexion biblique approfondie. Ne pas inventer d'informations.
    Structure: # [Titre de l'article] \n Thème: [Thème de l'article] \n Ensuite, pour chaque section du Cahier, suis le formatage spécifique demandé pour chaque partie.
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé. Élabore avec des points pertinents.'}. Réponds en Markdown.`;
    temperature = 0.2; 
  }

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: isLink 
        ? `Lien d'article à traiter: ${cleanedInput}` 
        : `Recherche et traite l'article pour: ${type} ${cleanedInput}`,
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig, // Utiliser la configuration d'outils dynamique
      },
    });

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
    
    const errorStr = JSON.stringify(error); // Stringify for robust error checking
    const status = error.status || (error.response && error.response.status); // Get HTTP status if available

    // Specific API key/billing errors
    if (status === 401 || errorStr.includes('Unauthorized') || errorStr.includes('invalid API key')) {
        throw new Error("INVALID_API_KEY");
    }
    // Les modèles utilisant des outils (comme googleSearch) nécessitent la facturation,
    // donc cette erreur est plus probable pour le modèle gemini-3-flash-preview.
    if (status === 403 || errorStr.includes('Forbidden') || errorStr.includes('billing')) {
        throw new Error("BILLING_REQUIRED");
    }

    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    // Une erreur de l'outil de recherche est maintenant mieux gérée par le changement de modèle,
    // mais si elle persiste, c'est probablement un quota de l'outil.
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search');
    
    if (isRateLimit) {
      if (retryCount < 2) {
        const wait = (retryCount + 1) * 20000;
        await sleep(wait);
        return generateStudyContent(type, input, part, settings, retryCount + 1);
      }
      throw new Error("COOLDOWN_REQUIRED");
    }

    if (isSearchToolError) {
      if (retryCount < 1 && !isLink) {
         const wait = 15000;
         await sleep(wait);
         return generateStudyContent(type, input, part, settings, retryCount + 1);
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