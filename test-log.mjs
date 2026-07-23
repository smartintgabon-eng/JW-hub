import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

content = content.replace(/let prompt = '';/g, 
`let prompt = '';
    console.log("=== DEBUG ===");
    console.log("input:", input);
    console.log("themeTitle:", themeTitle);
    console.log("finalThemeTitle (before try):", finalThemeTitle);`);

content = content.replace(/const config = withSearch \? \{ tools: \[\{ googleSearch: \{\} \}\] \} : \{\};/g, 
`const config = withSearch ? { tools: [{ googleSearch: {} }] } : {};
    console.log("finalThemeTitle (after try):", finalThemeTitle);
    console.log("scrapedContent length:", scrapedContent.length);`);

fs.writeFileSync('api/generate-content.js', content);
