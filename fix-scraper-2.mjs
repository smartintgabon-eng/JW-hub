import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// Axios throws 404 because jw.org redirects or formats URLs slightly differently when queried by axios without proper cookies or maybe trailing slash.
// But we don't have to fix the whole scraping if the LLM can fall back. Let's just make sure finalThemeTitle logic doesn't crash or output empty title.

content = content.replace(/let finalThemeTitle = themeTitle;/g, 
`let finalThemeTitle = themeTitle || "Analyse";`);

content = content.replace(/let extractedTitle = \$\('header h1'\)\.text\(\)\.trim\(\);\s*if \(!extractedTitle\) extractedTitle = meta\.title \|\| "";\s*if \(extractedTitle\) finalThemeTitle = extractedTitle;/g,
`let extractedTitle = $('header h1').text().trim();
                 if (!extractedTitle) extractedTitle = meta.title || "";
                 // Some jw.org 404 pages have a generic title, don't use it if it contains "introuvable"
                 if (extractedTitle && !extractedTitle.toLowerCase().includes("introuvable")) {
                     finalThemeTitle = extractedTitle;
                 }`);

fs.writeFileSync('api/generate-content.js', content);
