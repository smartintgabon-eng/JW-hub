import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

content = content.replace(/let extractedTitle = \$\('header h1'\)\.text\(\)\.trim\(\);\s*if \(!extractedTitle\) extractedTitle = meta\.title \|\| "";/g,
`let extractedTitle = $('header h1').text().trim();
                 if (!extractedTitle) extractedTitle = meta.title || "";
                 if (extractedTitle) finalThemeTitle = extractedTitle;`);

fs.writeFileSync('api/generate-content.js', content);
