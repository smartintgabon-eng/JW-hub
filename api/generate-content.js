import { GoogleGenAI } from '@google/genai';

let aiClient;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
    }
    // Trim the key to remove any accidental whitespace
    const validApiKey = apiKey.trim();
    if (!validApiKey) {
      throw new Error("GEMINI_API_KEY is empty.");
    }
    aiClient = new GoogleGenAI({ apiKey: validApiKey });
  }
  return aiClient;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { input, manualText, text, settings, type, part, discoursType, time, theme, articleReferences, pointsToReinforce, strengths, encouragements, contentOptions, preachingType } = req.body;

  try {
    const ai = getAiClient();
    let prompt = '';
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

    // Helper to generate content inclusion instructions
    const getContentInclusionInstructions = (options, refs) => {
      let instructions = "";
      if (options) {
        if (options.includeArticles) instructions += `\n- Utilise Google Search pour trouver et inclure des références précises à des articles de jw.org ou wol.jw.org. Formatte-les comme des liens Markdown cliquables [Titre](URL).`;
        if (options.includeImages) instructions += `\n- Suggère des images ou illustrations visuelles pertinentes.`;
        if (options.includeVideos) instructions += `\n- Suggère des vidéos pertinentes de jw.org.`;
        if (options.includeVerses) instructions += `\n- Inclus de nombreux versets bibliques clés avec leur explication.`;
      }
      if (refs && refs.length > 0) {
        instructions += `\n\nIMPORTANT: Utilise les informations de ces articles comme base principale. Lis leur contenu via tes outils de recherche : ${refs.join(', ')}`;
      }
      return instructions;
    };

    const commonInstructions = getContentInclusionInstructions(contentOptions, articleReferences);

    if (type === 'DISCOURS_THEME') {
      prompt = `Génère un thème de discours biblique accrocheur et profond.
Critères de l'utilisateur (optionnel) : "${input || 'Aucun critère spécifique'}".
Langue : ${settings?.language || 'fr'}.
Le thème doit être court (moins de 10 mots), percutant, et adapté à un public chrétien.
Ne renvoie QUE le thème, sans guillemets ni texte supplémentaire.`;
    } else if (type === 'DISCOURS') {
      prompt = `Tu es un orateur chrétien expérimenté. Prépare un plan détaillé pour un discours biblique.
Type de discours : ${discoursType}
Thème : "${theme}"
Durée prévue : ${time}
Langue : ${settings?.language || 'fr'}
Préférences de l'utilisateur : ${userPreferences}

Le discours doit inclure :
1. Une introduction captivante.
2. Un développement structuré avec des sous-thèmes clairs et des versets bibliques pertinents.
3. Une conclusion motivante.
Assure-toi que le contenu est adapté à la durée prévue (${time}).
${commonInstructions}`;

      if (pointsToReinforce) prompt += `\nPoints à renforcer : ${pointsToReinforce}`;
      if (strengths) prompt += `\nPoints forts : ${strengths}`;
      if (encouragements) prompt += `\nEncouragements : ${encouragements}`;

    } else {
      const contentToAnalyze = manualText || input || text;
      // For PREDICATION, input might be an array or string, handle it gracefully
      const contentString = Array.isArray(contentToAnalyze) ? contentToAnalyze.join('\n') : contentToAnalyze;

      if (!contentString && type !== 'PREDICATION') { 
         // Allow empty input if it's just a template generation, but usually we need something.
      }

      // Check if contentString contains URLs
      const containsUrl = /https?:\/\/[^\s]+/.test(contentString);
      let urlInstructions = "";
      if (containsUrl) {
        urlInstructions = "The input contains URLs. Use your Google Search tool to read the content of these URLs to inform your response. Do not just analyze the URL string itself. If the URL is from jw.org or wol.jw.org, prioritize the content from that source.";
      }

      prompt = `Analyze the following content and provide a structured explanation based on user preferences.\nContent/Context: "${contentString}"\n${urlInstructions}\nUser Preferences: ${userPreferences}\n${commonInstructions}\n`;
      
      if (type === 'WATCHTOWER') {
        prompt += `This is a Watchtower study article. Format the response with a clear title, a summary, and a detailed, point-by-point explanation for each paragraph or section. IMPORTANT: Also include the revision questions at the end and provide answers based on the article content.`;
      } else if (type === 'MINISTRY') {
        prompt += `This is a Ministry Workbook meeting part (${part || 'full'}). Format the response appropriately for this specific part, providing practical points, scriptures, and clear explanations.`;
      } else if (type === 'PREDICATION') {
         prompt += `This is a preparation for field ministry (${preachingType}). 
         Context: ${contentString}
         Provide a prepared presentation or discussion points suitable for this ministry type.
         Include:
         - An engaging opening question or remark.
         - A scripture to share and explain.
         - A transition to a publication or a follow-up question.
         - Practical tips for handling common objections if applicable.`;
      } else {
        prompt += `Format the response with a clear title, a summary, and a detailed, point-by-point explanation.`;
      }
    }

    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
    });

    if (!result || !result.text) {
      throw new Error("AI returned empty response");
    }

    let title = "Generated Content";
    if (type === 'DISCOURS_THEME') {
      return res.status(200).json({ theme: result.text.trim() });
    } else if (type === 'DISCOURS') {
      title = theme;
    } else {
      const titleMatch = result.text.match(/^# (.*)/m);
      if (titleMatch) title = titleMatch[1];
    }

    res.status(200).json({ text: result.text, title });

  } catch (error) {
    console.error('API Error in generate-content:', error);
    res.status(500).json({ message: 'Failed to generate content.', details: error.message || String(error) });
  }
}
