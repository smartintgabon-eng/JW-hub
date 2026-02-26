import { GoogleGenAI } from '@google/genai';

let aiClient;
function getAiClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { input, manualText, text, settings, type, part, discoursType, time, theme, articleReferences, imageReferences, videoReferences, pointsToReinforce, strengths, encouragements, contentOptions } = req.body;

  try {
    const ai = getAiClient();
    let prompt = '';
    const userPreferences = (settings?.answerPreferences || []).map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

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
Assure-toi que le contenu est adapté à la durée prévue (${time}).`;

      if (contentOptions) {
        if (contentOptions.includeArticles) prompt += `\n- Inclus des références à des articles pertinents de jw.org.`;
        if (contentOptions.includeImages) prompt += `\n- Suggère des images ou illustrations visuelles à utiliser.`;
        if (contentOptions.includeVideos) prompt += `\n- Suggère des vidéos pertinentes de jw.org à montrer.`;
        if (contentOptions.includeVerses) prompt += `\n- Inclus de nombreux versets bibliques clés avec leur explication.`;
      }

      if (articleReferences && articleReferences.length > 0) {
        const ministryLinks = articleReferences.filter(link => link.includes('mwb') || link.includes('vie-chretienne-et-ministere'));
        const otherLinks = articleReferences.filter(link => !link.includes('mwb') && !link.includes('vie-chretienne-et-ministere'));
        
        if (ministryLinks.length > 0) {
          prompt += `\n\nIMPORTANT: Ce discours est basé sur le Cahier Vie et Ministère. Utilise ces liens spécifiques pour structurer ton discours selon les instructions du cahier : ${ministryLinks.join(', ')}`;
        }
        if (otherLinks.length > 0) {
          prompt += `\nUtilise les informations de ces articles comme base : ${otherLinks.join(', ')}`;
        }
      }
      if (pointsToReinforce) prompt += `\nPoints à renforcer : ${pointsToReinforce}`;
      if (strengths) prompt += `\nPoints forts : ${strengths}`;
      if (encouragements) prompt += `\nEncouragements : ${encouragements}`;

    } else {
      const contentToAnalyze = manualText || input || text;
      if (!contentToAnalyze) {
        return res.status(400).json({ message: 'Content for analysis is required.' });
      }
      prompt = `Analyze the following content and provide a structured explanation based on user preferences.\nContent: "${contentToAnalyze}"\nUser Preferences: ${userPreferences}\n`;
      
      if (type === 'WATCHTOWER') {
        prompt += `This is a Watchtower study article. Format the response with a clear title, a summary, and a detailed, point-by-point explanation for each paragraph or section.`;
      } else if (type === 'MINISTRY') {
        prompt += `This is a Ministry Workbook meeting part (${part || 'full'}). Format the response appropriately for this specific part, providing practical points, scriptures, and clear explanations.`;
      } else {
        prompt += `Format the response with a clear title, a summary, and a detailed, point-by-point explanation.`;
      }
    }

    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }, { urlContext: {} }]
        }
    });

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
    res.status(500).json({ message: 'Failed to generate content.', details: error.message });
  }
}
