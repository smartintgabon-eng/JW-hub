import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// Replace the normal stream response
content = content.replace(/const readable = new ReadableStream\(\{\s*async start\(controller\) \{\s*try \{\s*for await \(const chunk of stream\) \{\s*const text = chunk\.text;\s*if \(text\) \{\s*controller\.enqueue\(encoder\.encode\(text\)\);\s*\}\s*\}\s*controller\.close\(\);\s*\} catch \(e\) \{\s*controller\.error\(e\);\s*\}\s*\}\s*\}\);\s*return new Response\(readable, \{\s*headers: \{ 'Content-Type': 'text\/plain; charset=utf-8' \}\s*\}\);/g, 
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

// Replace the error stream response
content = content.replace(/const readable = new ReadableStream\(\{\s*start\(controller\) \{\s*controller\.enqueue\(encoder\.encode\(errorMessage\)\);\s*controller\.close\(\);\s*\}\s*\}\);\s*return new Response\(readable, \{\s*headers: \{ 'Content-Type': 'text\/plain; charset=utf-8' \}\s*\}\);/g, 
`res.setHeader('Content-Type', 'text/plain; charset=utf-8');
res.write(errorMessage);
res.end();
`);

fs.writeFileSync('api/generate-content.js', content);
