import fs from 'fs';

let content = fs.readFileSync('api/search-content.js', 'utf8');

// Fix the JSON response in the error block
content = content.replace(/return new Response\(JSON\.stringify\(\{ message: errorMessage \}\), \{ status: 200, headers: \{ 'Content-Type': 'application\/json' \} \}\);/g, 
"return res.status(200).json({ message: errorMessage });");

// Fix the duplicated stream block in the error block
content = content.replace(/const encoder = new TextEncoder\(\);\s*res\.setHeader\('Content-Type', 'text\/plain; charset=utf-8'\);\s*res\.setHeader\('Transfer-Encoding', 'chunked'\);\s*try \{\s*for await \(const chunk of stream\) \{\s*const text = chunk\.text;\s*if \(text\) \{\s*res\.write\(text\);\s*\}\s*\}\s*res\.end\(\);\s*\} catch \(e\) \{\s*console\.error\("Stream error:", e\);\s*res\.end\(\);\s*\}/g,
`res.setHeader('Content-Type', 'text/plain; charset=utf-8');
res.write(errorMessage);
res.end();`);

fs.writeFileSync('api/search-content.js', content);
