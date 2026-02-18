import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

const cleanUrl = (url) => url?.trim().replace(/[,.;]+$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { type, input, part, settings, manualText } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Changed to GEMINI_API_KEY

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
    MISSION : Générer des réponses fidèles pour l'étude "${type}".

    RÈGLES DE GROUNDING STRICTES :
    1. Utilise googleSearch UNIQUEMENT pour fouiller jw.org et wol.jw.org.
    2. INTERDICTION d'inventer des faits non présents dans les publications.
    3. Si le texte est fragmenté, DÉDUIS la réponse uniquement selon les principes bibliques des publications JW 2024-2026.
    
    LOGIQUE SPÉCIFIQUE "${type}" :
    ${type === 'MINISTRY' ? `
      Partie demandée : ${part}.
      - JOYAUX : Discours structuré, intro engageante, points principaux avec versets (TMN), conclusion pratique.
      - PERLES : Réponses précises aux questions de recherche biblique.
      - APPLIQUE-TOI : Préparation pour l'exposé choisi.
      - VIE CHRÉTIENNE : Analyse profonde de l'article ou de la vidéo mentionnée.
      - ÉTUDE DE LIVRE : Réponses aux questions + OBLIGATOIREMENT 5 leçons d'application : 
        1. Prédication
        2. Famille
        3. Assemblée/Salle du Royaume
        4. Jéhovah
        5. Jésus.
    ` : `
      - TOUR DE GARDE : Analyse paragraphe par paragraphe (§).
      - STRUCTURE : QUESTION / RÉPONSE / VERSET / COMMENTAIRE / APPLICATION.
      - Inclure les questions de révision à la fin.
    `}

    STYLE : Clair, moderne, spirituellement encourageant. Réponds en Markdown.
  `;

  try {
    const contents = contextData 
      ? [{ text: `BASE DE DONNÉES :\n${contextData}\n\nACTION : Génère le contenu pour ${input || 'le texte fourni'}.` }] 
      : [{ text: `Recherche et analyse sur jw.org : ${input}` }];

    // Use gemini-2.5-flash for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Changed to gemini-2.5-flash
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