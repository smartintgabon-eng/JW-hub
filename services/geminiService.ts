
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

  if (isLink) {
    // Pour les liens directs, utiliser le modèle configuré par l'utilisateur (par défaut gemini-2.5-flash).
    // PAS besoin de googleSearch pour les liens directs, et gemini-2.5-flash n'est pas compatible avec.
    modelToUse = settings.modelName;
    toolsConfig = undefined; // Retirer l'outil googleSearch si ce n'est pas nécessaire
  } else {
    // Pour la recherche (date/thème), utiliser gemini-3-flash-preview car il supporte googleSearch (selon les exemples de la doc).
    // Cela implique des quotas plus stricts et potentiellement des exigences de facturation.
    modelToUse = 'gemini-3-flash-preview';
    toolsConfig = [{ googleSearch: {} }]; // Inclure l'outil googleSearch
  }

  let systemInstruction = '';
  let temperature = 0.1;

  if (type === 'WATCHTOWER') {
    systemInstruction = `Assistant JW. Extrait et analyse l'article de la Tour de Garde à partir du ${isLink ? "lien" : "sujet/date"} "${input}" pour le subdiviser.
    La réponse doit être basée sur les publications de jw.org et la Bible Traduction du Monde Nouveau.
    Structure: # [Titre de l'article] \n Thème: [Thème de l'article] \n PARAGRAPHE [N°]: Question, Verset (inclure le texte complet du verset entre parenthèses), Réponse (d'après le verset biblique et le paragraphe), Commentaire, Application. 
    À la fin, si disponibles, inclure les QUESTIONS DE RÉVISION: Question, Réponse.
    Style: ${settings.answerPreferences || 'Précis, factuel et fidèle aux enseignements bibliques'}. Réponds en Markdown.`;
    temperature = 0.1; 
  } else if (type === 'MINISTRY') {
    let partInstruction = '';
    switch (part) {
      case 'perles':
        partInstruction = 'Concentre-toi uniquement sur la section "Perles Spirituelles" en fournissant des réponses détaillées.';
        break;
      case 'joyaux':
        partInstruction = 'Concentre-toi uniquement sur la section "Joyaux de la Parole de Dieu", en incluant des propositions de discours basées sur les références.';
        break;
      case 'ministere':
        partInstruction = 'Concentre-toi uniquement sur la section "Applique-toi au Ministère", en incluant des propositions d\'exposés pour les différents types (visite initiale, nouvelle visite, cours biblique).';
        break;
      case 'vie_chretienne':
        partInstruction = 'Concentre-toi uniquement sur la section "Vie Chrétienne", en incluant des réponses et des discours basés sur les articles.';
        break;
      case 'etude_biblique':
        partInstruction = 'Concentre-toi uniquement sur la section "Étude Biblique de l\'Assemblée" (étude de livre ou brochure), en fournissant les réponses aux questions.';
        break;
      case 'tout':
      default:
        partInstruction = 'Fournis toutes les réponses et exemples d\'exposés pour chaque partie de l\'étude.';
        break;
    }

    systemInstruction = `Assistant JW. Extrait et analyse l'article du Cahier Vie et Ministère à partir du ${isLink ? "lien" : "sujet/date"} "${input}". ${partInstruction}
    La réponse doit être basée sur les publications de jw.org et la Bible Traduction du Monde Nouveau, en utilisant la réflexion biblique.
    Structure: # [Titre de l'article] \n Thème: [Thème de l'article] \n Pour chaque section/leçon:\n TITRE_SECTION: Question, Verset (inclure le texte complet du verset entre parenthèses), Réponse (d'après le verset biblique et le paragraphe), Commentaire, Application.
    À la fin de CHAQUE leçon/section, ajoute ces questions d'application: \n - Quelle leçon pouvons-nous tirer pour nous? \n - Quelle leçon pour la prédication? \n - Quelle leçon pour la famille? \n - Quelle leçon pour l'assemblée ou la salle du royaume? \n - Quelle leçon sur Jéhovah et Jésus?
    Style: ${settings.answerPreferences || 'Précis, factuel et fidèle aux enseignements bibliques. Élabore avec des points pertinents.'}. Réponds en Markdown.`;
    temperature = 0.2; // Diminué pour plus de précision et moins de créativité
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