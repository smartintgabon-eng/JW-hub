import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// There is a bug where the prompt has TWO H1 elements starting with the theme title, because:
// "OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre (H1) reprenant le thème exact : "# ${finalThemeTitle}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "*${today}*""
// If Gemini follows the instruction, it outputs: "# <title>\n *<date>*".
// BUT we see "# <title>\n *<date>* \n # <title>\n *<date>*" in the output. This is probably Gemini repeating itself or something.
// Let's modify the instruction to be very strict: "N'écris ce titre qu'UNE SEULE FOIS."

content = content.replace(/OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre \(H1\) reprenant le thème exact/g, 
"OBLIGATOIRE : Commence TOUJOURS ta réponse par un UNIQUE grand titre (H1) reprenant le thème exact");

content = content.replace(/\*\"\./g, '*\". N\'écris ce titre et cette date qu\'UNE SEULE FOIS au tout début.');

fs.writeFileSync('api/generate-content.js', content);
