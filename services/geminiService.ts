
import { GoogleGenAI } from "@google/genai";
import { StudyPart, AppSettings } from "../types";

export const generateStudyContent = async (
  type: 'WATCHTOWER' | 'MINISTRY',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings
): Promise<{ text: string; title: string; theme?: string }> => {
  
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Flash est utilisé pour sa rapidité et son efficacité avec les outils de recherche
  const modelName = 'gemini-3-flash-preview';
  
  const isLink = input.startsWith('http');
  const isDate = !isLink && /^\d{4}-\d{2}-\d{2}$/.test(input);

  // Construction de requêtes de recherche très ciblées
  let searchQuery = input;
  if (isDate) {
    const dateObj = new Date(input);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    searchQuery = `site:jw.org ${type === 'WATCHTOWER' ? 'article étude Tour de Garde' : 'cahier vie et ministère'} semaine du ${formattedDate}`;
  } else if (!isLink) {
    searchQuery = `site:jw.org ${type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier réunion'} ${input}`;
  }

  const systemInstruction = `
    TON RÔLE : Tu es un assistant expert pour l'étude des publications des Témoins de Jéhovah sur jw.org.
    
    RÈGLE CRITIQUE : Tu ne dois JAMAIS inventer de contenu. Tu DOIS obligatoirement utiliser l'outil googleSearch pour trouver l'article source sur jw.org avant de répondre.
    
    MÉTHODE :
    1. Utilise googleSearch pour localiser précisément l'article sur jw.org lié à : "${searchQuery}".
    2. Analyse le texte complet de l'article (titre, thème, questions, paragraphes et versets).
    3. Génère une réponse structurée fidèle au texte original.
    
    FORMAT DE RÉPONSE ATTENDU :
    # [TITRE DE L'ARTICLE]
    Thème : [Thème central]
    
    PARAGRAPHE 1
    QUESTION : [La question exacte de l'article]
    VERSET : [Citer le ou les versets mentionnés dans le paragraphe]
    RÉPONSE : [Réponse précise basée sur le paragraphe]
    COMMENTAIRE : [Un commentaire profond et encourageant]
    APPLICATION : [Une application pratique pour la vie chrétienne]
    
    (Répète pour chaque paragraphe trouvé)
    
    ${settings.answerPreferences ? `PRÉFÉRENCES DE L'UTILISATEUR : ${settings.answerPreferences}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: isLink ? `Analyse cet article : ${input}` : `Recherche et prépare l'étude pour : ${searchQuery}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Très bas pour assurer la fidélité au texte source
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text || "";
    if (!text || text.length < 150) {
       throw new Error("L'IA n'a pas pu extraire assez d'informations. Veuillez vérifier que le lien ou la date correspond bien à un article existant sur jw.org.");
    }

    const lines = text.split('\n').filter(l => l.trim() !== '');
    const titleMatch = text.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : (lines[0].replace(/[#*]/g, '').trim() || "Étude jw.org");
    
    const themeLine = lines.find(l => l.toLowerCase().includes('thème') || l.toLowerCase().includes('sujet'));
    const theme = themeLine ? themeLine.replace(/^[#*\s]*thème\s*:\s*/i, '').trim() : "";

    return { text, title, theme };
  } catch (error: any) {
    console.error("Erreur Gemini:", error);
    if (error.message?.includes('429')) {
      throw new Error("Le service est temporairement surchargé. Attendez 30 secondes.");
    }
    throw new Error(`Échec de la recherche : ${error.message || "Impossible d'accéder aux données de jw.org."}`);
  }
};
