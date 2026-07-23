import fs from 'fs';

let content = fs.readFileSync('api/search-content.js', 'utf8');

content = content.replace(/return new Response\(result\.text, \{\s*headers: \{ 'Content-Type': 'application\/json' \}\s*\}\);/g, 
`res.setHeader('Content-Type', 'application/json');
return res.send(result.text);`);

content = content.replace(/return new Response\(JSON\.stringify\(fallbackJson\), \{\s*headers: \{ 'Content-Type': 'application\/json' \}\s*\}\);/g, 
`return res.json(fallbackJson);`);

fs.writeFileSync('api/search-content.js', content);
