
import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

const cleanUrl = (url) => url?.trim().replace(/[,.;]+$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { type, input, part, settings, manualText } = req.body;
  /* Fix: Use process.env.API_KEY for GenAI initialization */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

  let contextData = "";
  if (manualText) {
    contextData = `TEXTE SAISI MANUELLEMENT :\n${manualText}`;
  } else if (typeof input === 'string' && input.startsWith('http')) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(input)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const $ = cheerio.load(data.contents);
      $('#article, .pGroup, .bodyTxt, .qu, .marker').each((i, el) => {
        contextData += $(el).text() + "\n";
      });
    } catch (e) {
      console.error("Scraping failed");
    }
  }

  const systemInstruction = `
    Tu es un assistant expert JW (Témoins de Jéhovah). 
    MISSION : Générer des réponses PRÊTES À L'EMPLOI pour l'étude "${type}".
    Langue de la réponse : ${settings.language || 'fr'}.
    Préférences utilisateur pour le style de réponse : "${settings.answerPreferences || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.'}".

    RÈGLES D'OR :
    - INTERDICTION de dire "Vous pouvez répondre que..." ou "Préparez votre réponse".
    - Tu DOIS donner la réponse directement comme si l'utilisateur allait la lire ou l'écrire.

    INSTRUCTIONS PAR SECTION :
    ${type === 'MINISTRY' ? `
      Partie demandée : ${part}.
      - JOYAUX : Discours structuré, intro engageante, points principaux avec versets (TMN), conclusion pratique. Rédige le contenu complet prêt à être lu.
      - PERLES SPIRITUELLES : Analyse la lecture biblique de la semaine indiquée. Donne impérativement 9 perles CONCRÈTES (3 sur Jéhovah, 3 sur le ministère, 3 sur la vie chrétienne). Chaque perle doit mentionner le chapitre et le verset exact concerné de la lecture biblique.
      - APPLIQUE-TOI : Préparation pour l'exposé choisi. Rédige le contenu complet prêt à être lu.
      - VIE CHRÉTIENNE : Analyse profonde de l'article ou de la vidéo mentionnée et donne les réponses aux questions posées dans le cahier.
      - ÉTUDE BIBLIQUE DE L'ASSEMBLÉE : Réponds à TOUTES les questions de l'histoire (paragraphes) ET ajoute systématiquement les 5 leçons d'application (Soi-même, Famille, Prédication, Salle, Jéhovah, Jésus).
    ` : `
      - TOUR DE GARDE : Si un TEXTE SAISI MANUELLEMENT est présent, utilise-le comme source UNIQUE et PRIORITAIRE pour l'analyse. S'il n'est pas fourni, utilise les liens.
      - Analyse chaque paragraphe (§), donne la question, la réponse complète, les versets et une application.
      - Ajoute les questions de révision à la fin.
    `}

    STYLE : Fidèle aux publications, encourageant et moderne. Formatage Markdown.
  `;

  try {
    const contents = contextData 
      ? [{ text: `BASE DE DONNÉES :\n${contextData}\n\nACTION : Génère le contenu pour ${input || 'le texte fourni'}.` }] 
      : [{ text: `Recherche et analyse sur jw.org : ${input}` }];

    /* Fix: Use gemini-3-flash-preview for general text tasks like summarization and analysis */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        temperature: 0.2 
      },
    });

    const text = response.text || "Désolé, je n'ai pas pu générer de contenu. Vérifiez la source.";
    const titleMatch = text.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : (type === 'WATCHTOWER' ? "Tour de Garde" : "Cahier de Réunion");

    return res.status(200).json({ text, title });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ message: "Erreur de quota ou de connexion Gemini. Réessayez dans quelques instants." });
  }
}
