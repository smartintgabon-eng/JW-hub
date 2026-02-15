import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio'; // Import cheerio

// Fix: setTimeout expects a function as its first argument
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cleanUrl = (url) => {
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

export default async function handler(req, res) {
  // IMPORTANT: Log this to Vercel's console to see if the API route is even being hit.
  console.log("API Route /api/generate-content hit!");
  console.log("Request method:", req.method);
  // console.log("Request body:", req.body); // Uncomment for full debugging, but be cautious with sensitive data.

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, input, part, settings, isInitialSearchForPreview, preachingType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY; // Using GEMINI_API_KEY for serverless
  if (!apiKey) {
    console.error("API Key is missing in environment variables.");
    return res.status(500).json({ message: "Clé API absente. Vérifiez votre configuration sur Vercel." });
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http'); 

  let modelToUse = 'gemini-2.5-flash'; // Unified to gemini-2.5-flash as requested
  
  let toolsConfig = undefined; // Default to no tools
  let systemInstruction = '';
  let temperature = 0.2; 
  
  let modelContents; // This will hold the actual 'contents' payload for Gemini

  // --- NEW: Conditional content preparation based on input type (link vs search) ---
  if (isLink) {
    // SCRIBING MODE: Fetch and scrape the content directly from the URL
    try {
      console.log(`Scraping content from URL: ${cleanedInput}`);
      const responseHtml = await fetch(cleanedInput, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.jw.org/', 
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      if (!responseHtml.ok) {
        // This handles HTTP errors like 403, 404, 500 from the target server
        let errorMessage = `Échec de la récupération de l'URL avec le code statut ${responseHtml.status}.`;
        if (responseHtml.status === 403) {
          errorMessage += " Accès refusé par le serveur cible (peut-être un blocage anti-bot).";
        } else if (responseHtml.status === 404) {
          errorMessage += " Page non trouvée (vérifiez l'URL).";
        }
        throw new Error(errorMessage);
      }
      const html = await responseHtml.text();
      const $ = cheerio.load(html);
      // Extract text from body, clean multiple spaces and trim
      const texteComplet = $('body').text().replace(/\s\s+/g, ' ').trim(); 
      
      if (!texteComplet || texteComplet.length < 100) { // Basic check for minimal content
        throw new Error("Contenu extrait insuffisant ou page vide.");
      }

      // Gemini's contents will directly include the scraped text
      modelContents = [
        { text: `Voici le contenu complet de la page à l'URL : ${cleanedInput} \n\n` },
        { text: texteComplet }
      ];
      // No search tool needed as content is provided directly
      toolsConfig = undefined; 

      // Update grounding instruction for system to reflect direct content provision
      systemInstruction = `Vous agissez en tant qu'Assistant JW expert en publications. Vous avez reçu le texte brut d'une page web. Votre tâche est d'analyser ce texte. La réponse doit être **impérativement basée** et strictement fidèle aux informations et références (bibliques complètes, publications jw.org) trouvées *directement* dans le texte fourni. Ne pas inventer d'informations.`;

    } catch (scrapeError) {
      console.error("Scraping error:", scrapeError);
      // Differentiate between network 'fetch failed' errors and other scraping errors
      if (scrapeError instanceof TypeError && String(scrapeError).includes('fetch failed')) { // Use String(scrapeError) to catch underlying message
         return res.status(500).json({ message: `Erreur de connexion lors de l'extraction de l'URL (problème réseau ou blocage). Veuillez vérifier l'URL et votre connexion Internet, ou réessayez plus tard. (Code: 500-NETWORK)` });
      }
      // For other errors (HTTP errors caught by !responseHtml.ok, Cheerio errors, etc.)
      return res.status(500).json({ message: `Erreur lors de l'extraction du contenu de la page : ${scrapeError.message}. Vérifiez l'URL ou réessayez. (Code: 500-SCRAPE)` });
    }

  } else {
    // SEARCH MODE: Use Google Search tool for queries by date/theme
    toolsConfig = [{ googleSearch: {} }]; 
    modelContents = `Utilise l'outil Google Search pour trouver et analyser l'information pertinente pour le sujet/la date/le contexte : "${input}". Ensuite, génère le contenu selon les instructions de système.`;
    
    // Update grounding instruction for system to reflect Google Search usage
    systemInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'analyser l'information obtenue via l'outil Google Search pour le contenu "${input}" sur jw.org. Utilisez les résultats de recherche que vous avez trouvés pour extraire et analyser l'information. Soyez très fidèle et ne pas inventer d'informations. Si vous ne trouvez pas assez d'informations ou si les résultats sont ambigus, indiquez-le clairement.`;
  }
  // --- END NEW CONTENT PREPARATION ---


  if (type === 'WATCHTOWER') {
    systemInstruction += `\n\nSubdivisez l'article de manière structurée et très détaillée. Priorise la clarté et la concision tout en étant exhaustif.
    
    Structure: 
    # [Titre de l'article] 
    Thème: [Thème de l'article] 
    
    PARAGRAPHE [N°]: 
    QUESTION: [Question du paragraphe]
    VERSET: (Inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau)
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
    
    switch (part) {
      case 'joyaux_parole_dieu':
        partInstruction = `**JOYAUX DE LA PAROLE DE DIEU**
        Fournis une proposition d'exposé détaillée pour le discours principal de cette section, en te basant sur le contenu de l'article. L'exposé doit inclure:
        Thème: [Thème clair pour l'exposé, basé sur l'article]
        INTRODUCTION: [Une introduction engageante basée sur l'article]
        POINTS PRINCIPAUX:
        - [Point 1 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau) et des références aux publications officielles de jw.org (ex: wXX XX/X p.XX §X). Développe ce point en t'appuyant sur l'article.]
        - [Point 2 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau) et des références aux publications officielles de jw.org (ex: wXX XX/X p.XX §X). Développe ce point en t'appuyant sur l'article.]
        CONCLUSION: [Une conclusion pratique et encourageante basée sur l'article]
        `;
        break;
      case 'perles_spirituelles':
        partInstruction = `**PERLES SPIRITUELLES**
        Pour chaque perle spirituelle, en te basant sur le contenu de l'article et de ses références, suis le format suivant:
        VERSET: (Verset biblique complet entre parenthèses, Traduction du Monde Nouveau, lié à la perle)
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
        - [Point 1 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau) et des références aux publications jw.org. Développe ce point en t'appuyant sur l'article.]
        - [Point 2 avec des références bibliques complètes (inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau) et des références aux publications jw.org. Développe ce point en t'appuyant sur l'article.]
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
        En te basant sur le contenu de'l'article (et les références de livre/brochure), fournis les "RÉPONSES :" détaillées aux questions de l'étude.
        `;
        // Ajoute les questions d'application SEULEMENT pour cette partie
        partInstruction += `\n\n${getApplicationQuestions()}`;
        break;
      case 'tout':
      default:
        partInstruction = `Fournis des réponses et exemples d'exposés détaillés pour **Toutes les parties** du Cahier, dans l'ordre suivant, en te basant sur le contenu de l'article principal et de ses références:
        
        **JOYAUX DE LA PAROLE DE DIEU**
        (Suit le format détaillé des Joyaux de la Parole de Dieu, y compris Thème, Introduction, Points principaux avec références bibliques complètes (Traduction du Monde Nouveau) et Conclusion.)
        
        **PERLES SPIRITUELLES**
        (Follows the detailed format for Spiritual Gems, including Verse (New World Translation), Q1, R1, Comment, Application, Q2, R2.)
        
        **APPLIQUE-TOI AU MINISTÈRE**
        (Suit le format détaillé de Applique-toi au Ministère, listant tous les exposés avec Introduction, Points à développer (avec références bibliques complètes Traduction du Monde Nouveau) et Conclusion pour chacun.)
        
        **VIE CHRÉTIENNE**
        (Suit le format détaillé de Vie Chrétienne, incluant Réponses aux questions et Points de discussion.)
        
        **ÉTUDE BIBLIQUE DE L'ASSEMBLÉE**
        (Suit le format détaillé de l'Étude Biblique de l'Assemblée, incluant les Réponses aux questions de l'étude.)
        ${getApplicationQuestions()}
        `;
        break;
    }

    systemInstruction += `\n\nStructure: 
    # [Titre de l'article du Cahier] 
    Thème: [Thème général de la semaine] 
    
    ${partInstruction}
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé. Élabore avec des points pertinents.'}. Réponds en Markdown.`;
    temperature = 0.2; 
  } else if (type === 'PREDICATION') {
    let preachingInstruction = '';
    
    switch (preachingType) {
      case 'porte_en_porte':
        preachingInstruction = `Préparer une présentation de porte-en-porte. Le sujet est "${input}".`;
        
        systemInstruction += `\n\nStructure:
        # SUJET: [Titre concis et accrocheur basé sur le sujet et la publication]
        ENTRÉE EN MATIÈRE: [Une introduction simple et naturelle pour engager la conversation, basée sur l'actualité si fournie ou sur des préoccupations courantes. Inclure une question pour lancer la discussion.]
        VERSETS CLÉS: (Verset biblique complet entre parenthèses, Traduction du Monde Nouveau, adapté au sujet. Expliquer brièvement le lien avec le sujet.)
        ${input.includes('Offre étude:') ? 
          `OFFRE DE COURS BIBLIQUE: [Proposer un cours biblique avec la brochure "Vivez pour toujours" en utilisant le lien ${input.split('Offre étude: ')[1]?.split(',')[0] || ''}. Expliquer l'intérêt.]` 
          : `QUESTION POUR REVENIR: [Une question simple à poser à la fin de la discussion pour créer un intérêt pour la prochaine visite.]`}
        
        Style: Simple, facile à retenir, pratique. Utilise un langage courant.`;
        break;
      case 'nouvelle_visite':
        preachingInstruction = `Préparer une nouvelle visite. ${input}.`;
        
        systemInstruction += `\n\nStructure:
        # MANIÈRE DE FAIRE: [Une approche naturelle pour la nouvelle visite, reprenant le fil de la discussion précédente ou la question en suspens.]
        ${input.includes('Question en suspens:') ? 
          `RÉPONSE À LA QUESTION: [Réponse claire et basée sur la Bible (versets complets Traduction du Monde Nouveau entre parenthèses) à la question laissée en suspens "${input.split('Question en suspens: ')[1]?.split(',')[0] || ''}".]` 
          : `CONTINUITÉ DU COURS: [Reprendre le cours biblique là où il s'était arrêté ("${input.split('Arrêté à: ')[1] || ''}") en utilisant la publication spécifiée. Inclure une question pour réviser et une pour le point suivant.]`}
        
        PROPOSITION COURS BIBLIQUE: [Si non déjà un cours, proposer un cours biblique en utilisant le lien ${input.includes('Offre étude:') ? input.split('Offre étude: ')[1]?.split(',')[0] : '' || 'vers la brochure "Vivez pour toujours"'}, en expliquant les avantages.]
        
        Style: Simple, facile à retenir, pratique. Axé sur la progression de l'intérêt.`;
        break;
      case 'cours_biblique':
        preachingInstruction = `Préparer un cours biblique. ${input}.`;
        
        systemInstruction += `\n\nStructure:
        # MANIÈRE DE FAIRE: [Plan détaillé pour conduire le cours biblique. Expliquer comment aborder le chapitre/leçon, souligner les points clés, utiliser les versets bibliques (complets Traduction du Monde Nouveau entre parenthèses) et les questions.]
        POINTS CLÉS À SOULIGNER: [Liste de 3-4 points importants du chapitre/leçon, avec des références aux publications si possibles.]
        QUESTIONS À POSER: [Quelques questions de compréhension ou d'application à poser pendant l'étude.]
        
        Style: Clair, pédagogique, encourageant la participation de l'étudiant.`;
        break;
      default:
        preachingInstruction = `Générer une préparation de prédication pour le sujet: ${input}.`;
        break;
    }

    systemInstruction += `\n\nStyle: ${settings.answerPreferences || 'Simple, facile à retenir, pratique. Utilise un langage courant et des versets bibliques complets Traduction du Monde Nouveau.'}. Réponds en Markdown.`;
    temperature = 0.5; 
  }

  // Si c'est une recherche initiale pour l'aperçu, on utilise un prompt plus court et moins exigeant.
  if (isInitialSearchForPreview) {
    let previewInstruction = '';
    if (type === 'WATCHTOWER' || type === 'MINISTRY') {
      previewInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'identifier le titre et le thème principal de l'article lié à "${input}".
      Réponds uniquement avec le format suivant: # [Titre de l'article] \n Thème: [Thème de l'article]. Ne fournis aucun autre détail ou contenu de l'article.`;
    } else if (type === 'PREDICATION') {
      previewInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est de fournir un titre et un bref résumé pour une préparation de prédication de type "${preachingType}" avec le sujet "${input}".
      Réponds uniquement avec le format suivant: # [Titre de la préparation] \n Thème: [Bref résumé de l'objectif]. Ne fournis aucun autre détail.`;
    }
    // Prepend the specific grounding instruction to the preview instruction
    systemInstruction = (isLink ? systemInstruction : '') + '\n\n' + previewInstruction;
  }


  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: modelContents, // Now intelligently set as scraped text or search prompt
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig, // Now intelligently set (undefined for scrape, googleSearch for search)
      },
    });

    const text = response.text || "";
    
    if (!text || text.length < 50 || text.toLowerCase().includes('désolé') || text.toLowerCase().includes('impossible de trouver') || text.toLowerCase().includes('ne peut pas accéder à des sites web externes') || text.toLowerCase().includes('erreur') || text.toLowerCase().includes('aucune information')) {
      throw new Error("MODEL_PROCESSING_ERROR");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : (preachingType ? `Préparation ${preachingType.replace(/_/g, ' ')}` : "Étude Biblique");
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return res.status(200).json({ text, title, theme });

  } catch (error) {
    console.error("Gemini API Error (in serverless function):", error); // More specific log
    
    const errorStr = JSON.stringify(error); 
    const status = error.status || (error.response && error.response.status); 

    // Specific API key/billing errors
    if (status === 401 || errorStr.includes('Unauthorized') || errorStr.includes('invalid API key')) {
        return res.status(401).json({ message: "Clé API invalide. Vérifiez que votre clé est correcte et configurée dans votre projet Google Cloud (et Vercel si déployé)." });
    }
    if (status === 403 || errorStr.includes('Forbidden') || errorStr.includes('billing')) {
        return res.status(403).json({ message: "La recherche nécessite une configuration de facturation active sur Google Cloud, même pour les usages gratuits. (ai.google.dev/gemini-api/docs/billing)" });
    }

    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search') || errorStr.includes('not found');
    
    // Serverless functions are stateless, so client-side retry logic is preferred.
    // We return clear messages for the client to handle cooldowns.
    if (isRateLimit) {
      return res.status(429).json({ message: `Limite des requêtes Google atteinte. Veuillez patienter 90s pour réessayer. Les tentatives répétées prolongeront ce délai. (Code: 429)` });
    }

    if (isSearchToolError) {
      return res.status(500).json({ message: "Le service de recherche Google est temporairement saturé ou n'a pas trouvé de résultats pertinents. Veuillez réessayer avec un 'Lien direct' ou patientez. (Code: 500-SEARCH)" });
    }
    
    if (error.message === "MODEL_PROCESSING_ERROR") {
        return res.status(500).json({ message: "L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente. Assurez-vous que le lien est valide et public. (Code: 500-AI)" });
    }

    // Generic error
    return res.status(500).json({ message: `Une erreur de communication est survenue avec l'API Gemini. Statut: ${status || 'inconnu'}. Détails: ${error.message}. (Code: 500-GENERIC)` });
  }
}