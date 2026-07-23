import fs from 'fs';

let content = fs.readFileSync('api/get-color.js', 'utf8');

content = content.replace(/const \{ colorName \} = await req\.json\(\);/g, "const { colorName } = req.body || {};");

content = content.replace(/return new Response\(JSON\.stringify\(\{ message: 'colorName is required' \}\), \{ status: 400 \}\);/g, 
"return res.status(400).json({ message: 'colorName is required' });");

content = content.replace(/return new Response\(JSON\.stringify\(\{ hex \}\), \{\s*headers: \{ 'Content-Type': 'application\/json' \}\s*\}\);/g, 
"return res.json({ hex });");

content = content.replace(/return new Response\(JSON\.stringify\(\{ message: "Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer\." \}\), \{ status: 200 \}\);/g, 
"return res.status(200).json({ message: \"Désolé, je n'ai pas pu récupérer cette information, veuillez réessayer.\" });");

fs.writeFileSync('api/get-color.js', content);
