import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

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
  console.log("API Route /api/generate-content hit!");
  console.log("Request method:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, input, part, settings, isInitialSearchForPreview, preachingType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing in environment variables.");
    return res.status(500).json({ message: "Clé API absente. Vérifiez votre configuration sur Vercel." });
  }

  const ai = new GoogleGenAI({ apiKey });

  const cleanedInput = cleanUrl(input);
  const isLink = cleanedInput.startsWith('http');

  let modelToUse = 'gemini-2.5-flash';
  let toolsConfig = [{ googleSearch: {} }];
  let systemInstruction = '';
  let temperature = 0.2;

  let modelContents;
  let contextTextFromProxy = "";
  
  // Définit le titre de l'article pour les connaissances internes si besoin
  const articleTitleForKnowledge = type === 'WATCHTOWER' ? `Tour de Garde ${input}` : `Cahier Vie et Ministère ${input}`;

  // --- Core Authoritative Prompting for Gemini ---
  // Cette fonction construit l'instruction principale pour Gemini, incluant les directives autoritaires.
  const buildAuthoritativeSystemInstruction = (sourceType) => `
    Tu es un assistant expert pour l'étude de la Bible et les publications des Témoins de Jéhovah.
    
    ${sourceType === 'proxy' ? `Le texte suivant est une extraction brute de l'article jw.org. Même si le texte semble mélangé, cherche les numéros de paragraphes et les questions.` : ''}
    ${sourceType === 'googleSearch' ? `Tu as utilisé l'outil Google Search pour trouver et analyser l'article jw.org. ` : ''}

    TA MISSION :
    1. Tu DOIS générer les réponses pour chaque paragraphe.
    2. Si tu vois une question (souvent précédée par 'QUESTION:' ou identifiable par sa position), c'est le début d'un paragraphe.
    3. Ne dis JAMAIS que tu ne peux pas accéder au texte ou qu'il est insuffisant. Utilise ce que tu as pour reconstruire l'étude.
    4. Si vraiment une partie du texte est manquante ou que le contenu est ambigu, utilise tes connaissances internes sur les publications des Témoins de Jéhovah de ${new Date().getFullYear()}/${new Date().getFullYear() + 1} (et spécifiquement sur l'article "${articleTitleForKnowledge}" si connu) pour reconstituer fidèlement les questions d'étude, les versets et la structure.

    FORMAT GÉNÉRAL POUR TOUS LES ARTICLES :
    # [Titre de l'article]
    Thème: [Thème de l'article]

    PARAGRAPHE [N°]:
    QUESTION: [Question du paragraphe, extraite ou formulée contextuellement]
    VERSET: (Inclure le texte complet du verset biblique entre parenthèses, Traduction du Monde Nouveau, ou indiquer 'Non trouvé' si absent)
    RÉPONSE: (D'après le verset biblique et le paragraphe, inclure des détails et des explications en vous basant *directement* sur le contenu de l'article/page web, des snippets de recherche ou tes connaissances si le texte est lacunaire.)
    COMMENTAIRE: (Un point d'approfondissement ou une idée supplémentaire pertinente tirée de l'article.)
    APPLICATION: (Comment appliquer personnellement cette information.)

    Répéter ce format pour chaque paragraphe.
    
    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé'}. Réponds en Markdown.
  `;


  if (isLink) {
    try {
      console.log(`Attempting to fetch content via AllOrigins proxy for URL: ${cleanedInput}`);
      // Ajout de ?incLocale=fr pour tenter de forcer le contenu en français
      const urlToProxy = cleanedInput.includes('incLocale=') ? cleanedInput : `${cleanedInput}?incLocale=fr`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlToProxy)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Failed to fetch via proxy with status: ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      const htmlContent = proxyData.contents;

      const $ = cheerio.load(htmlContent);
      let extractedContent = '';
      
      // Cheerio: Cibler spécifiquement <div id="article"> ou .pGroup pour la Tour de Garde
      const targetContainer = $('#article, .bodyTxt'); // Cibler le conteneur principal de l'article
      if (targetContainer.length > 0) {
          targetContainer.find('.qu, .pGroup, h2, h3, ul, ol, p').each((i, el) => { // Inclure p pour le texte général
              const text = $(el).text().trim();
              if (text) {
                  if ($(el).is('h2, h3')) { extractedContent += `\n# ${text}\n\n`; } 
                  else if ($(el).is('.qu')) { extractedContent += `QUESTION: ${text}\n`; } 
                  else if ($(el).is('.pGroup')) {
                      const paragraphNumber = $(el).find('.marker').text().trim();
                      if (paragraphNumber) { extractedContent += `PARAGRAPHE ${paragraphNumber}:\n`; }
                      extractedContent += text.replace(paragraphNumber, '').trim() + '\n\n';
                  } else if ($(el).is('li')) { extractedContent += `- ${text}\n`; } 
                  else if ($(el).is('p')) { extractedContent += text + '\n\n'; }
              }
          });
      }
      
      contextTextFromProxy = extractedContent.replace(/\s\s+/g, ' ').trim(); 

      if (contextTextFromProxy && contextTextFromProxy.length > 200) { 
        modelContents = [{ text: contextTextFromProxy }];
        systemInstruction = buildAuthoritativeSystemInstruction('proxy');
        console.log("Content successfully fetched via proxy and will be used by Gemini.");
      } else {
        console.warn("Proxy fetch resulted in insufficient content. Falling back to Google Search tool for link analysis.");
        modelContents = [{ text: `Recherche de l'article jw.org à l'adresse: ${cleanedInput}` }]; // Utiliser l'input original pour la recherche Google
        systemInstruction = buildAuthoritativeSystemInstruction('googleSearch');
      }

    } catch (proxyError) {
      console.error("Error fetching via proxy. Falling back to Google Search tool:", proxyError);
      modelContents = [{ text: `Recherche de l'article jw.org à l'adresse: ${cleanedInput}` }];
      systemInstruction = buildAuthoritativeSystemInstruction('googleSearch');
    }
  } else { // C'est une recherche par date/thème, Google Search est la méthode directe
    modelContents = [{ text: `Recherche d'informations sur jw.org pour: "${input}".` }];
    systemInstruction = buildAuthoritativeSystemInstruction('googleSearch');
  }

  // --- Instructions spécifiques au type de contenu (WATCHTOWER, MINISTRY, PREDICATION) ---
  // Ces instructions APPENDENT aux instructions de base (autoritaires) définies ci-dessus.
  // Elles ajoutent les formats spécifiques à chaque section.

  if (type === 'WATCHTOWER') {
    systemInstruction += `\n\n${(isLink && contextTextFromProxy && contextTextFromProxy.length > 200) ? '' : `// Si le texte est insuffisant, utilise la recherche Google pour 'Questions et paragraphes Tour de Garde ${input}'\n`}
    // Ajout spécifique pour la Tour de Garde:
    À la fin de l'article, inclure toutes les QUESTIONS DE RÉVISION:
    QUESTION: [Question de révision]
    RÉPONSE: [Réponse détaillée basée sur le contenu de l'article/page web, des snippets de recherche ou tes connaissances si le texte est lacunaire]
    `;
    temperature = 0.1;
  } else if (type === 'MINISTRY') {
    let partInstruction = '';

    switch (part) {
      case 'joyaux_parole_dieu':
        partInstruction = `\n\n**JOYAUX DE LA PAROLE DE DIEU**
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
        partInstruction = `\n\n**PERLES SPIRITUELLES**
        Pour chaque perle spirituelle, en te basant sur le contenu de l'article et de ses références, suis le format suivant:
        VERSET: (Verset biblique complet entre parenthèses, Traduction du Monde Nouveau, lié à la perle)
        QUESTION: [La première question de la perle spirituelle, textuellement de l'article]
        RÉPONSE: [Réponse détaillée basée sur la publication de référence ou l'article lui-même]
        COMMENTAIRE: [Point d'approfondissement ou idée supplémentaire tirée de l'article]
        APPLICATION: (Comment appliquer personnellement cette perle tirée de l'article)
        QUESTION: [La deuxième question sur les leçons à tirer de la lecture biblique de la semaine, textuellement de l'article]
        RÉPONSE: [Réponse détaillée sur les leçons personnelles, pour la prédication, etc., tirée de l'article]
        `;
        break;
      case 'applique_ministere':
        partInstruction = `\n\n**APPLIQUE-TOI AU MINISTÈRE**
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
        partInstruction = `\n\n**VIE CHRÉTIENNE**
        En te basant sur le contenu de l'article (et en simulant l'analyse d'une vidéo si elle est mentionnée dans le texte), fournis des "RÉPONSES :" détaillées aux questions de discussion et des "POINTS DE DISCUSSION :" pratiques. Ces réponses et points doivent être basés sur les principes bibliques et les publications de jw.org mentionnées dans l'article.
        `;
        break;
      case 'etude_biblique_assemblee':
        partInstruction = `\n\n**ÉTUDE BIBLIQUE DE L'ASSEMBLÉE**
        En te basant sur le contenu de'l'article (et les références de livre/brochure), fournis les "RÉPONSES :" détaillées aux questions de l'étude.
        `;
        partInstruction += `\n\n${getApplicationQuestions()}`;
        break;
      case 'tout':
      default:
        partInstruction = `\n\nFournis des réponses et exemples d'exposés détaillés pour **Toutes les parties** du Cahier, dans l'ordre suivant, en te basant sur le contenu de l'article principal et de ses références:
        
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
    systemInstruction += partInstruction;
    temperature = 0.2;
  } else if (type === 'PREDICATION') {
    let preachingInstruction = '';
    
    switch (preachingType) {
      case 'porte_en_porte':
        preachingInstruction = `\n\nPréparer une présentation de porte-en-porte. Le sujet est "${input}".`;
        
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
        preachingInstruction = `\n\nPréparer une nouvelle visite. ${input}.`;
        
        systemInstruction += `\n\nStructure:
        # MANIÈRE DE FAIRE: [Une approche naturelle pour la nouvelle visite, reprenant le fil de la discussion précédente ou la question en suspens.]
        ${input.includes('Question en suspens:') ? 
          `RÉPONSE À LA QUESTION: [Réponse claire et basée sur la Bible (versets complets Traduction du Monde Nouveau entre parenthèses) à la question laissée en suspens "${input.split('Question en suspens: ')[1]?.split(',')[0] || ''}".]` 
          : `CONTINUITÉ DU COURS: [Reprendre le cours biblique là où il s'était arrêté ("${input.split('Arrêté à: ')[1] || ''}") en utilisant la publication spécifiée. Inclure une question pour réviser et une pour le point suivant.]`}
        
        PROPOSITION COURS BIBLIQUE: [Si non déjà un cours, proposer un cours biblique en utilisant le lien ${input.includes('Offre étude:') ? input.split('Offre étude: ')[1]?.split(',')[0] : '' || 'vers la brochure "Vivez pour toujours"'}, en expliquant les avantages.]
        
        Style: Simple, facile à retenir, pratique. Axé sur la progression de l'intérêt.`;
        break;
      case 'cours_biblique':
        preachingInstruction = `\n\nPréparer un cours biblique. ${input}.`;
        
        systemInstruction += `\n\nStructure:
        # MANIÈRE DE FAIRE: [Plan détaillé pour conduire le cours biblique. Expliquer comment aborder le chapitre/leçon, souligner les points clés, utiliser les versets bibliques (complets Traduction du Monde Nouveau entre parenthèses) et les questions.]
        POINTS CLÉS À SOULIGNER: [Liste de 3-4 points importants du chapitre/leçon, avec des références aux publications si possibles.]
        QUESTIONS À POSER: [Quelques questions de compréhension ou d'application à poser pendant l'étude.]
        
        Style: Clair, pédagogique, encourageant la participation de l'étudiant.`;
        break;
      default:
        preachingInstruction = `\n\nGénérer une préparation de prédication pour le sujet: ${input}.`;
        break;
    }
    systemInstruction += preachingInstruction;
    temperature = 0.5;
  }

  // Si c'est une recherche initiale pour l'aperçu, cette instruction écrase toutes les précédentes.
  if (isInitialSearchForPreview) {
    let previewInstruction = '';
    if (type === 'WATCHTOWER' || type === 'MINISTRY') {
      previewInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est d'identifier le titre et le thème principal de l'article lié à "${input}".
      Réponds uniquement avec le format suivant: # [Titre de l'article] \n Thème: [Thème de l'article]. Ne fournis aucun autre détail ou contenu de l'article.`;
    } else if (type === 'PREDICATION') {
      previewInstruction = `En tant qu'Assistant JW expert en publications, votre tâche est de fournir un titre et un bref résumé pour une préparation de prédication de type "${preachingType}" avec le sujet "${input}".
      Réponds uniquement avec le format suivant: # [Titre de la préparation] \n Thème: [Bref résumé de l'objectif]. Ne fournis aucun autre détail.`;
    }
    systemInstruction = previewInstruction; // Écrase tout pour le mode prévisualisation
  }

  try {
    // Si modelContents est un tableau avec le texte extrait par proxy, il est envoyé tel quel.
    // Sinon, c'est une recherche Google, et le `input` original est utilisé.
    const actualModelContents = Array.isArray(modelContents) ? modelContents : [{text: modelContents}];

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: actualModelContents,
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig,
      },
    });

    const text = response.text || "";
    
    if (!text || text.length < 50 || text.toLowerCase().includes('désolé') || text.toLowerCase().includes('impossible de trouver') || text.toLowerCase().includes('ne peut pas accéder à des sites web externes') || text.toLowerCase().includes('erreur') || text.toLowerCase().includes('aucune information') || text.toLowerCase().includes('aucun résultat de recherche')) {
      throw new Error("MODEL_PROCESSING_ERROR_WITH_GOOGLE_SEARCH");
    }

    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : (preachingType ? `Préparation ${preachingType.replace(/_/g, ' ')}` : "Étude Biblique");
    const theme = text.match(/Thème\s*:\s*(.*)/i)?.[1]?.trim() || "";

    return res.status(200).json({ text, title, theme });

  } catch (error) {
    console.error("Gemini API Error (in serverless function):", error);
    
    const errorStr = JSON.stringify(error);
    const status = error.status || (error.response && error.response.status);

    if (status === 401 || errorStr.includes('Unauthorized') || errorStr.includes('invalid API key')) {
        return res.status(401).json({ message: "Clé API invalide. Vérifiez que votre clé est correcte et configurée dans votre projet Google Cloud (et Vercel si déployé)." });
    }
    if (status === 403 || errorStr.includes('Forbidden') || errorStr.includes('billing')) {
        return res.status(403).json({ message: "La recherche nécessite une configuration de facturation active sur Google Cloud, même pour les usages gratuits. (ai.google.dev/gemini-api/docs/billing)" });
    }

    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('exhausted');
    const isSearchToolError = errorStr.includes('tool error') || errorStr.includes('Google Search') || errorStr.includes('not found');
    
    if (isRateLimit) {
      return res.status(429).json({ message: `Limite des requêtes Google atteinte. Veuillez patienter 90s pour réessayer. Les tentatives répétées prolongeront ce délai. (Code: 429)` });
    }

    if (isSearchToolError || error.message === "MODEL_PROCESSING_ERROR_WITH_GOOGLE_SEARCH") {
      return res.status(500).json({ message: "Échec de l'analyse du lien via le proxy AllOrigins ou l'outil Google Search. Le site jw.org est probablement en train de bloquer toutes les requêtes automatiques pour ce lien ou le contenu est insuffisant. Veuillez essayer la 'Recherche par date/thème' comme alternative. (Code: 500-LINK-BLOCKED)" });
    }
    if (error.message === "MODEL_PROCESSING_ERROR") {
        return res.status(500).json({ message: "L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente. Assurez-vous que le lien est valide et public. (Code: 500-AI)" });
    }

    return res.status(500).json({ message: `Une erreur de communication est survenue avec l'API Gemini. Statut: ${status || 'inconnu'}. Détails: ${error.message}. (Code: 500-GENERIC)` });
  }
}