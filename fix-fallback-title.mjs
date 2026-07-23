import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');

// For the direct kv cached URLs
content = content.replace(/scrapedContent \+= `\\n\\n\[IMAGE_URL: \$\{firstValid\.imageUrl\}\]`;\s*\}/g,
`scrapedContent += \`\\n\\n[IMAGE_URL: \${firstValid.imageUrl}]\`;
             }
             if (firstValid && firstValid.title) {
                 finalThemeTitle = firstValid.title;
             }`);
             
fs.writeFileSync('api/generate-content.js', content);
