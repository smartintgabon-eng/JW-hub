import fs from 'fs';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Signature
  content = content.replace(/export default async function handler\(req(?:, res)?\) \{/, 'export default async function handler(req, res) {');
  
  // 405
  content = content.replace(/return new Response\(JSON\.stringify\(\{ message: 'Method Not Allowed' \}\), \{ status: 405 \}\);/g, "return res.status(405).json({ message: 'Method Not Allowed' });");
  
  // req.json()
  content = content.replace(/const body = await req\.json\(\);/g, "const body = req.body || {};");
  
  // For generate-content streams:
  // Instead of new ReadableStream and new Response
  
  // Just rewrite server.ts FIRST so we can see what's better.
  
  fs.writeFileSync(file, content);
}

fixFile('api/generate-content.js');
fixFile('api/search-content.js');
fixFile('api/get-color.js');
