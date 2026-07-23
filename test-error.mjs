import fs from 'fs';
let content = fs.readFileSync('api/generate-content.js', 'utf8');
content = content.replace(/let errorMessage = "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer\.";/g, 
`let errorMessage = "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer. " + errorStr;`);
fs.writeFileSync('api/generate-content.js', content);
