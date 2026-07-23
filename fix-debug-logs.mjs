import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');
content = content.replace(/console\.log\("=== DEBUG ==="\);\s*console\.log\("input:", input\);\s*console\.log\("themeTitle:", themeTitle\);\s*console\.log\("finalThemeTitle \(before try\):", finalThemeTitle\);/g, '');
fs.writeFileSync('api/generate-content.js', content);
