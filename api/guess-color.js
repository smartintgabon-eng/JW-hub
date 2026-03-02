import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Texte manquant' });
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
    
    const prompt = `Analyse le thème biblique suivant et donne-moi UNIQUEMENT un code hexadécimal de couleur qui lui correspond (ex: #4a6da7). 
Le code doit être sombre et élégant. Thème : "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    
    const responseText = response.text;

    // Extraction propre du code HEX (au cas où l'IA met du texte autour)
    const hexMatch = responseText.match(/#[0-9A-Fa-f]{6}/);
    const finalHex = hexMatch ? hexMatch[0] : "#4a6da7";

    return res.status(200).json({ hex: finalHex });
  } catch (error) {
    console.error("Erreur Couleur:", error);
    // En cas d'erreur (clé API invalide par exemple), on renvoie le bleu JW par défaut
    return res.status(200).json({ hex: "#4a6da7" });
  }
}
