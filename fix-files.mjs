import fs from 'fs';

let genContent = fs.readFileSync('api/generate-content.js', 'utf8');

// Fix themeTitle being a URL
genContent = genContent.replace(/let finalThemeTitle = themeTitle \|\| "Analyse";/g, 
`let finalThemeTitle = themeTitle || "Analyse";
    if (finalThemeTitle.startsWith('http')) {
        finalThemeTitle = "Analyse de l'article";
    }`);

fs.writeFileSync('api/generate-content.js', genContent);

let searchContent = fs.readFileSync('api/search-content.js', 'utf8');

// Fix reflection in search-content.js
searchContent = searchContent.replace(/2\. Ajoute ta propre réflexion, analyse et méditation spirituelle pour enrichir la réponse\./g, 
"2. N'inclus aucune phrase d'introduction ou de métadiscours. Donne directement les réponses.");

// Fix Title being a URL in search-content.js just in case
searchContent = searchContent.replace(/const themeTitle = questionOrSubject \|\| "Recherche";/g,
`let themeTitle = questionOrSubject || "Recherche";
    if (themeTitle.startsWith('http')) {
        themeTitle = "Recherche d'article";
    }`);

// Also fix the multiple H1 issue in search-content
searchContent = searchContent.replace(/OBLIGATOIRE : Commence TOUJOURS ta réponse par un grand titre \(H1\) reprenant le thème exact : "# \$\{themeTitle\}", suivi immédiatement sur la ligne suivante de la date du jour en italique : "\*\$\{today\}\*"\./g,
"OBLIGATOIRE : Commence TOUJOURS ta réponse par un UNIQUE grand titre (H1) reprenant le thème exact : \"# ${themeTitle}\", suivi immédiatement sur la ligne suivante de la date du jour en italique : \"*${today}*\". N'écris ce titre et cette date qu'UNE SEULE FOIS au tout début.");

fs.writeFileSync('api/search-content.js', searchContent);
