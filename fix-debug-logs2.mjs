import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');
content = content.replace(/console\.log\("finalThemeTitle \(after try\):", finalThemeTitle\);\s*console\.log\("scrapedContent length:", scrapedContent\.length\);/g, '');
fs.writeFileSync('api/generate-content.js', content);
