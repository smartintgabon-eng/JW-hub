import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Tu es un assistant de recherche expert JW spécialisé dans jw.org et wol.jw.org.
    
    TA MISSION :
    1. Utilise impérativement l'outil Google Search pour fouiller jw.org et wol.jw.org sur : "${questionOrSubject}".
    2. Ne dis JAMAIS que tu n'as pas accès. Si les résultats sont flous, utilise tes connaissances sur les publications 2024/2025.
    3. DÉDUCTION SPIRITUELLE : Utilise les fragments de texte trouvés pour déduire une réponse spirituelle logique et basée sur les principes bibliques JW.
    
    FORMAT DE RÉPONSE STRICT :
    ## Sources Brutes Trouvées :
    --- DÉBUT SOURCE ---
    Titre: [Titre de l'article]
    Lien: [URL complète]
    Contenu extrait: [Texte brut trouvé]
    --- FIN SOURCE ---
    
    ## Explication de l'IA :
    [Donne une explication précise, pédagogique et détaillée de tes recherches.]
    
    ## Liens des Sources :
    - [URL] ([Titre])
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: `Effectue une recherche approfondie sur : ${questionOrSubject}` }],
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.4
      },
    });

    const fullText = response.text || "";
    
    // Parsing
    const aiExpMatch = fullText.match(/## Explication de l'IA :\n([\s\S]*?)## Liens/);
    const aiExplanation = aiExpMatch ? aiExpMatch[1].trim() : fullText;

    const rawSources = [];
    const sourceBlocks = fullText.split('--- DÉBUT SOURCE ---').slice(1);
    sourceBlocks.forEach(block => {
      const title = block.match(/Titre: (.*)\n/)?.[1] || "Source JW";
      const uri = block.match(/Lien: (.*)\n/)?.[1] || "";
      const content = block.match(/Contenu extrait: ([\s\S]*?)--- FIN SOURCE ---/)?.[1] || "";
      rawSources.push({ title, uri, content: content.trim() });
    });

    return res.status(200).json({ 
      text: aiExplanation, 
      title: questionOrSubject, 
      rawSources, 
      aiExplanation 
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Erreur lors de la recherche. Quotas Gemini probablement atteints." });
  }
}