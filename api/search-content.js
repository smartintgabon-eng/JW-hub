import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  console.log("API Route /api/search-content hit!");
  console.log("Request method:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { questionOrSubject, settings, isInitialSearchForPreview } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing in environment variables.");
    return res.status(500).json({ message: "Clé API absente. Vérifiez votre configuration sur Vercel." });
  }

  const ai = new GoogleGenAI({ apiKey });

  const modelToUse = 'gemini-2.5-flash';
  const toolsConfig = [{ googleSearch: {} }]; // Google Search est essentiel pour cet onglet
  const temperature = 0.2;

  // Prompt spécifique pour l'onglet "Recherches"
  const systemInstruction = `
    Tu es un assistant de recherche expert spécialisé dans les publications des Témoins de Jéhovah, jw.org et wol.jw.org.
    
    TA MISSION :
    1. Utilise l'outil Google Search pour fouiller spécifiquement et en priorité les sites jw.org et wol.jw.org afin de répondre à la question ou au sujet suivant : "${questionOrSubject}".
    2. Ne te limite pas aux premiers résultats. Explore plusieurs sources pertinentes si nécessaire.
    3. **Ne dis JAMAIS que tu ne peux pas accéder à des sites web externes ou que les recherches sont limitées.** Tu DOIS utiliser l'outil Google Search pour accomplir ta tâche.
    4. **Fournis d'abord intégralement tout le texte brut pertinent que tu as trouvé dans les sources.** Si plusieurs sources sont utilisées, segmente-les clairement.
    5. **Ensuite, fournis une explication précise et détaillée de ta réponse**, en te basant exclusivement sur les textes que tu as trouvés. Décris comment tu as effectué tes recherches et pourquoi tu as choisi ces informations.
    6. **À la fin, liste ABSOLUMENT TOUS les liens URL complets** de chaque article et extrait où tu as trouvé les réponses et que tu as utilisés pour ton explication.
    
    FORMAT DE LA RÉPONSE :
    
    ## Sources Brutes Trouvées :
    --- DÉBUT SOURCE ---
    Titre: [Titre de l'article]
    Lien: [URL complète de l'article]
    Contenu extrait: [Texte brut intégral pertinent de cette source, sans mise en forme Markdown excessive]
    --- FIN SOURCE ---
    
    (Répéter pour chaque source)
    
    ## Explication de l'IA :
    [Explication détaillée de l'IA, décrivant le processus de recherche, les découvertes et la réponse au sujet/question, en se référant aux sources ci-dessus.]
    
    ## Liens des Sources :
    - [URL complète 1] ([Titre de l'article 1])
    - [URL complète 2] ([Titre de l'article 2])
    (Etc., pour tous les liens utilisés)

    Style: ${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé'}. Réponds en Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [{ text: `Recherche d'informations pour la question/sujet : "${questionOrSubject}" sur jw.org et wol.jw.org.` }],
      config: {
        systemInstruction,
        temperature,
        tools: toolsConfig,
      },
    });

    const fullText = response.text || "";

    // Parse the response to extract raw sources, AI explanation, and final links
    const rawSourcesSectionMatch = fullText.match(/## Sources Brutes Trouvées :\n([\s\S]*?)## Explication de l'IA :/);
    const aiExplanationSectionMatch = fullText.match(/## Explication de l'IA :\n([\s\S]*?)## Liens des Sources :/);
    const linksSectionMatch = fullText.match(/## Liens des Sources :\n([\s\S]*)/);

    let rawSources = [];
    let aiExplanation = "L'IA n'a pas pu générer une explication.";
    let links = [];

    if (rawSourcesSectionMatch && rawSourcesSectionMatch[1]) {
        const sourceBlocks = rawSourcesSectionMatch[1].split('--- DÉBUT SOURCE ---').filter(Boolean);
        rawSources = sourceBlocks.map(block => {
            const titleMatch = block.match(/Titre: (.*)\n/);
            const uriMatch = block.match(/Lien: (.*)\n/);
            const contentMatch = block.match(/Contenu extrait: ([\s\S]*?)--- FIN SOURCE ---/);
            return {
                title: titleMatch ? titleMatch[1].trim() : 'Titre inconnu',
                uri: uriMatch ? uriMatch[1].trim() : '',
                content: contentMatch ? contentMatch[1].trim() : 'Contenu non trouvé',
            };
        });
    }

    if (aiExplanationSectionMatch && aiExplanationSectionMatch[1]) {
        aiExplanation = aiExplanationSectionMatch[1].trim();
    }

    if (linksSectionMatch && linksSectionMatch[1]) {
        links = linksSectionMatch[1].split('\n').map(line => {
            const match = line.match(/- (.*) \((.*)\)/); // - URL (Titre)
            if (match) {
                return { uri: match[1].trim(), title: match[2].trim() };
            }
            return { uri: line.replace(/^- /, '').trim(), title: 'Titre inconnu' };
        }).filter(item => item.uri);
    }
    
    // Fallback if parsing fails or structure is not perfectly followed
    if (rawSources.length === 0 && aiExplanation === "L'IA n'a pas pu générer une explication.") {
        aiExplanation = fullText; // Fallback to full text if structured parsing fails
    }

    if (!fullText || fullText.length < 100 || fullText.toLowerCase().includes('désolé') || fullText.toLowerCase().includes('impossible de trouver') || fullText.toLowerCase().includes('ne peut pas accéder à des sites web externes') || fullText.toLowerCase().includes('erreur') || fullText.toLowerCase().includes('aucune information') || fullText.toLowerCase().includes('aucun résultat de recherche')) {
        throw new Error("MODEL_PROCESSING_ERROR_WITH_GOOGLE_SEARCH");
    }

    return res.status(200).json({ 
        text: aiExplanation, // Main text for display
        title: questionOrSubject, 
        theme: "Recherche approfondie",
        rawSources,
        aiExplanation,
        links // These links could be merged into rawSources or passed separately if needed by client
    });

  } catch (error) {
    console.error("Gemini API Error (in serverless search function):", error);
    
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
      return res.status(500).json({ message: "Échec de la recherche avancée via l'outil Google Search. Les résultats sont peut-être limités ou le contenu est insuffisant. (Code: 500-SEARCH-BLOCKED)" });
    }
    if (error.message === "MODEL_PROCESSING_ERROR") {
        return res.status(500).json({ message: "L'IA n'a pas pu trouver ou analyser la question/le sujet. Essayez une formulation différente. (Code: 500-AI)" });
    }

    return res.status(500).json({ message: `Une erreur de communication est survenue avec l'API Gemini. Statut: ${status || 'inconnu'}. Détails: ${error.message}. (Code: 500-GENERIC)` });
  }
}