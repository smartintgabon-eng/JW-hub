import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');
content = content.replace(/return res\.json\(\{\s*debug_input: input,\s*debug_themeTitle: themeTitle,\s*debug_finalThemeTitle: finalThemeTitle,\s*debug_scrapedContentLength: scrapedContent\.length\s*\}\);\s*const config = withSearch \? \{ tools/g, 
`const config = withSearch ? { tools`);
fs.writeFileSync('api/generate-content.js', content);
