import fs from 'fs';

let content = fs.readFileSync('api/search-content.js', 'utf8');

// Fix 400 Response
content = content.replace(/return new Response\(JSON\.stringify\(\{ message: 'Question or subject is required\.' \}\), \{ status: 400 \}\);/g, 
"return res.status(400).json({ message: 'Question or subject is required.' });");

// Fix Stream logic
content = content.replace(/const readable = new ReadableStream\([\s\S]*?return new Response\(readable, \{\s*headers: \{ 'Content-Type': 'text\/plain; charset=utf-8' \}\s*\}\);/g, 
`res.setHeader('Content-Type', 'text/plain; charset=utf-8');
res.setHeader('Transfer-Encoding', 'chunked');
try {
  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      res.write(text);
    }
  }
  res.end();
} catch (e) {
  console.error("Stream error:", e);
  res.end();
}`);

fs.writeFileSync('api/search-content.js', content);
