import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { type, input, part, settings, manualMode, preachingType, discoursType, theme, time, articleReferences, imageReferences, videoReferences, pointsToReinforce, strengths, encouragements } = req.body;
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
    const model = ai.models.getGenerativeModel({ model: settings?.modelName || "gemini-1.5-flash" });

    let prompt = "";

    if (type === 'PREDICATION') {
      const details = Array.isArray(input) ? input.join('\n') : input;
      prompt = `
        Tu es un assistant pour les Témoins de Jéhovah.
        Prépare une présentation pour la prédication : ${preachingType?.replace(/_/g, ' ')}.
        
        Détails :
        ${details}
        
        Structure la réponse avec :
        1. Une introduction efficace
        2. Un verset biblique clé avec transition
        3. Une question ouverte pour la prochaine fois
        
        Ton : Encouragent, respectueux, biblique.
      `;
    } else if (type === 'DISCOURS') {
      prompt = `
        Prépare un plan de discours ${discoursType} de ${time}.
        Thème : ${theme}
        
        Références à inclure :
        ${articleReferences?.join('\n')}
        ${imageReferences?.join('\n')}
        ${videoReferences?.join('\n')}
        
        Points à renforcer : ${pointsToReinforce?.join(', ')}
        Points forts : ${strengths?.join(', ')}
        Encouragements : ${encouragements}
        
        Structure : Introduction, Corps (Points principaux), Conclusion.
      `;
    } else if (type === 'DISCOURS_THEME') {
        prompt = `Propose un thème biblique pour un discours basé sur : ${input}. Réponds juste avec le thème.`;
    } else {
      // Default / Watchtower / Ministry
      prompt = `
        Analyse ce contenu (${type} - ${part}) :
        ${input}
        
        ${manualMode ? 'Basé sur ce texte fourni manuellement.' : 'Basé sur les connaissances générales.'}
        
        Fais un résumé avec les points clés, les versets importants et une application pratique.
      `;
    }

    const result = await model.generateContent({ contents: prompt });
    const responseText = result.text;
    
    // Extract title if possible, else use a generic one
    const titleMatch = responseText.match(/^#+\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1] : (theme || "Nouvelle Étude");

    return res.status(200).json({ 
      title: title,
      text: responseText 
    });

  } catch (error) {
    console.error("Generate Content Error:", error);
    return res.status(500).json({ message: "Erreur de génération", details: error.message });
  }
}
