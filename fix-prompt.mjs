import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// 1. Fix the themeTitle
content = content.replace(/let scrapedContent = "";/g, 
`let scrapedContent = "";
    let finalThemeTitle = themeTitle;`);

content = content.replace(/let extractedTitle = \$\('header h1'\)\.text\(\)\.trim\(\);\s*if \(!extractedTitle\) extractedTitle = meta\.title \|\| "";\s*let articleContent = '';/g,
`let extractedTitle = $('header h1').text().trim();
                 if (!extractedTitle) extractedTitle = meta.title || "";
                 if (extractedTitle) finalThemeTitle = extractedTitle;
                 let articleContent = '';`);
                 
// Also need to pass finalThemeTitle instead of themeTitle to the prompt.
content = content.replace(/\$\{themeTitle\}/g, '${finalThemeTitle}');

// 2. Fix the réflexion
content = content.replace(/2\. Ajoute ta propre réflexion, analyse et méditation spirituelle pour enrichir la réponse\./g, 
"2. N'inclus aucune phrase d'introduction ou de métadiscours (ex: \"Voici l'analyse\", \"Voici ma réflexion\", \"Voici les réponses\"). Ne montre pas ton processus de réflexion.");

fs.writeFileSync('api/generate-content.js', content);
