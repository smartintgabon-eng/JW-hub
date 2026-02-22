import { GoogleGenAI } from "@google/genai";
import * as cheerio from 'cheerio';

const cleanUrl = (url) => url?.trim().replace(/[,.;]+$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { type, input, part, settings, manualText, discoursType, time, theme, articleReferences, imageReferences, videoReferences, pointsToReinforce, strengths, encouragements } = req.body;
  /* Fix: Use process.env.API_KEY for GenAI initialization */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

  let contextData = "";
  if (manualText) {
    contextData = `TEXTE SAISI MANUELLEMENT :\n${manualText}`;
  } else if (typeof input === 'string' && input.startsWith('http')) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(input)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        console.error(`Proxy request failed with status: ${response.status}`);
        return;
      }
      const data = await response.json();

      if (!data || !data.contents || typeof data.contents !== 'string') {
        console.error('Proxy returned invalid content structure.');
        return;
      }

      try {
        const $ = cheerio.load(data.contents);
        $('#article, .pGroup, .bodyTxt, .qu, .marker').each((i, el) => {
          contextData += $(el).text() + "\n";
        });
      } catch (cheerioError) {
        console.error('Cheerio parsing failed:', cheerioError);
      }

    } catch (e) {
      console.error("Scraping failed");
    }
  }

  let systemInstruction = '';
  let contents: any[] = [];

  const userPreferences = settings.answerPreferences.map(p => p.text).join(', ') || 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.';

  if (type === 'DISCOURS_THEME') {
    systemInstruction = `\
      Tu es un assistant expert JW (Témoins de Jéhovah) spécialisé dans la génération de thèmes de discours.\
      MISSION : Proposer un thème de discours pertinent basé sur les critères fournis.\
      Langue de la réponse : ${settings.language || 'fr'}.\
      Préférences utilisateur pour le style de réponse : "${userPreferences}".\
\
      RÈGLES D'OR :\
      - Propose UN SEUL thème clair et concis.\
      - Ne donne AUCUN texte supplémentaire en dehors du thème.\
    `;
    contents = [{ text: `Critères pour le thème : ${input}` }];
  } else if (type === 'DISCOURS') {
    const references = [
      ...articleReferences.map(ref => `Article: ${cleanUrl(ref)}`),
      ...imageReferences.map(ref => `Image: ${cleanUrl(ref)}`),
      ...videoReferences.map(ref => `Vidéo: ${cleanUrl(ref)}`),
    ].filter(Boolean).join('\n');

    const specialFields = [];
    if (pointsToReinforce && pointsToReinforce.length > 0) specialFields.push(`Points à renforcer pour l'assemblée : ${pointsToReinforce.join(', ')}`);
    if (strengths && strengths.length > 0) specialFields.push(`Points forts de l'assemblée : ${strengths.join(', ')}`);
    if (encouragements) specialFields.push(`Encouragements supplémentaires : ${encouragements}`);

    systemInstruction = `\
      Tu es un assistant expert JW (Témoins de Jéhovah) spécialisé dans la rédaction de discours.\
      MISSION : Rédiger un discours complet et prêt à l'emploi.\
      Langue de la réponse : ${settings.language || 'fr'}.\
      Préférences utilisateur pour le style de réponse : "${userPreferences}".\
\
      RÈGLES D'OR :\
      - Le discours doit être facile à comprendre, à expliquer et à utiliser.\
      - Utilise TOUJOURS la Bible. Cite les versets complets (ex: Psaume 105:5) et explique-les.\
      - Intègre les références (articles, images, vidéos) de manière fluide et explique leur contenu.\
      - Le discours doit respecter le temps imparti : ${time}.\
      - Ne donne AUCUN texte d'introduction comme "Voici votre discours..." ou de conclusion comme "J'espère que cela vous aidera...". Commence directement le discours.\
      - Formatage Markdown.\
\
      INSTRUCTIONS SPÉCIFIQUES AU TYPE DE DISCOURS (${discoursType.toUpperCase()}) :\
      ${discoursType === 'normal' ? `\
        - Discours général, peut inclure des images et des vidéos.\
      ` : ''}\
      ${discoursType === 'jeudi' ? `\
        - Discours de 1 à 15 minutes. Ne doit pas inclure de vidéos ou d'images. Peut inclure des citations d'articles de jw.org et wol.jw.org.\
      ` : ''}\
      ${discoursType === 'dimanche' ? `\
        - Discours de 30 minutes. Peut inclure des images et des vidéos. Intègre les citations d'articles de jw.org et wol.jw.org.\
      ` : ''}\
      ${discoursType === 'special' ? `\
        - Discours spécial. Inclut les points à renforcer, les points forts et les encouragements spécifiques à l'assemblée.\
      ` : ''}\
\
      INFORMATIONS SUPPLÉMENTAIRES :\
      Thème : ${theme}\
      ${references ? `Références :\n${references}` : ''}\
      ${specialFields.length > 0 ? specialFields.join('\n') : ''}\
    `;
    contents = [{ text: `Rédige le discours sur le thème "${theme}" pour ${time}.` }];

  } else {
    systemInstruction = `\
      Tu es un assistant expert JW (Témoins de Jéhovah). \
      MISSION : Générer des réponses PRÊTES À L'EMPLOI pour l'étude "${type}".\
      Langue de la réponse : ${settings.language || 'fr'}.\
      Préférences utilisateur pour le style de réponse : "${userPreferences}".\
\
      RÈGLES D'OR :\
      - INTERDICTION de dire "Vous pouvez répondre que..." ou "Préparez votre réponse".\
      - Tu DOIS donner la réponse directement comme si l'utilisateur allait la lire ou l'écrire.\
\
      INSTRUCTIONS PAR SECTION :\
      ${type === 'MINISTRY' ? `\
        Partie demandée : ${part}.\
        - JOYAUX : Discours structuré, intro engageante, points principaux avec versets (TMN), conclusion pratique. Rédige le contenu complet prêt à être lu.\
        - PERLES SPIRITUELLES : Analyse la lecture biblique de la semaine indiquée, en te basant sur les chapitres spécifiques. Donne impérativement 9 perles CONCRÈTES (3 sur Jéhovah, 3 sur le ministère, 3 sur la vie chrétienne). Chaque perle doit mentionner le chapitre et le verset exact concerné de la lecture biblique.\
        - APPLIQUE-TOI : Préparation pour l'exposé choisi. Rédige le contenu complet prêt à être lu.\
        - VIE CHRÉTIENNE : Analyse profonde de l'article ou de la vidéo mentionnée et donne les réponses aux questions posées dans le cahier.\
        - ÉTUDE BIBLIQUE DE L'ASSEMBLÉE : Réponds à TOUTES les questions de l'histoire (paragraphes) ET ajoute systématiquement les 5 leçons d'application (Soi-même, Famille, Prédication, Salle, Jéhovah, Jésus).\
      ` : `\
        - TOUR DE GARDE : Si un TEXTE SAISI MANUELLEMENT est présent, utilise-le comme source UNIQUE et PRIORITAIRE pour l'analyse. S'il n'est pas fourni, utilise les liens.\
        - Analyse chaque paragraphe (§), donne la question, la réponse complète, les versets et une application.\
        - Ajoute les questions de révision à la fin.\
      `}\
\
      STYLE : Fidèle aux publications, encourageant et moderne. Formatage Markdown.\
    `;\

    contents = contextData \
      ? [{ text: `BASE DE DONNÉES :\n${contextData}\n\nACTION : Génère le contenu pour ${input || 'le texte fourni'}.` }] \
      : [{ text: `Recherche et analyse sur jw.org : ${input}` }];
  }

  try {
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
    let title = "";
    if (type === 'DISCOURS_THEME') {
      title = text.trim(); // Theme is the direct response
      return res.status(200).json({ theme: title });
    } else if (type === 'DISCOURS') {
      title = theme; // Use the confirmed theme as title
    } else {
      const titleMatch = text.match(/^# (.*)/m);
      title = titleMatch ? titleMatch[1] : (type === 'WATCHTOWER' ? "Tour de Garde" : "Cahier de Réunion");
    }

    return res.status(200).json({ text, title });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ message: "Erreur de quota ou de connexion Gemini. Réessayez dans quelques instants." });
  }

}