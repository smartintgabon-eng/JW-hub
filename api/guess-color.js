import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Texte manquant' });
  
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing");
    }
    const genAI = new GoogleGenAI({ apiKey: apiKey.trim() });
    
    const prompt = `Analyse le thème biblique suivant et donne-moi UNIQUEMENT un code hexadécimal de couleur qui lui correspond (ex: #4a6da7). 
Le code doit être sombre et élégant. Thème : "${text}"`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    
    const responseText = result.text;

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
