import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');
content = content.replace(/const config = withSearch \? \{ tools/g, 
`return res.json({ 
  debug_input: input, 
  debug_themeTitle: themeTitle, 
  debug_finalThemeTitle: finalThemeTitle,
  debug_scrapedContentLength: scrapedContent.length
});
    const config = withSearch ? { tools`);
fs.writeFileSync('api/generate-content.js', content);
