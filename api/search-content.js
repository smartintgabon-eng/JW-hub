import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { questionOrSubject, settings } = req.body;

  if (!questionOrSubject || questionOrSubject.trim().length === 0) {
    return res.status(400).json({ message: "Veuillez entrer une question ou un sujet." });
  }

  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Tu es un assistant de recherche expert spécialisé dans jw.org et wol.jw.org.
    
    TA MISSION :
    1. Utilise l'outil Google Search pour fouiller jw.org et wol.jw.org sur le sujet : "${questionOrSubject}".
    2. Ne dis JAMAIS que tu ne peux pas accéder au contenu. Si tu ne trouves rien, utilise tes connaissances sur les publications des Témoins de Jéhovah de 2024/2025.
    3. RÉPONSE OBLIGATOIREMENT STRUCTURÉE :
    
    ## Sources Brutes Trouvées :
    --- DÉBUT SOURCE ---
    Titre: [Titre de l'article]
    Lien: [URL complète]
    Contenu extrait: [Texte brut complet trouvé]
    --- FIN SOURCE ---
    
    ## Explication de l'IA :
    [Donne une explication précise de tes recherches et du résultat.]
    
    ## Liens des Sources :
    - [URL] ([Titre])
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ text: `Recherche approfondie sur : ${questionOrSubject}` }],
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });

    const fullText = response.text || "";
    
    // Parse structured data
    const aiExpMatch = fullText.match(/## Explication de l'IA :\n([\s\S]*?)## Liens/);
    const aiExplanation = aiExpMatch ? aiExpMatch[1].trim() : fullText;

    const rawSources = [];
    const sourceBlocks = fullText.split('--- DÉBUT SOURCE ---').slice(1);
    sourceBlocks.forEach(block => {
      const title = block.match(/Titre: (.*)\n/)?.[1] || "Source";
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
    return res.status(500).json({ message: "Erreur lors de la recherche. Quotas probablement atteints." });
  }
}