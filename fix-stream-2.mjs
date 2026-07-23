import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// Replace the normal stream response
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

fs.writeFileSync('api/generate-content.js', content);
