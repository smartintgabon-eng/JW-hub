const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Signature
  content = content.replace(/export default async function handler\(req\) \{/, 'export default async function handler(req, res) {');
  
  // 2. HTTP 405 error
  content = content.replace(/return new Response\(JSON\.stringify\(\{ message: 'Method Not Allowed' \}\), \{ status: 405 \}\);/g, "return res.status(405).json({ message: 'Method Not Allowed' });");
  
  // 3. Request body
  content = content.replace(/const body = await req\.json\(\);/g, "const body = req.body || {};");
  
  // 4. Return stream
  // For new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  // We'll replace the readable stream logic with res.write() and res.end()
  // Wait, replacing stream logic using regex is hard. Let's do it carefully.
  
  fs.writeFileSync(file, content);
}

fixFile('api/generate-content.js');
// fixFile('api/search-content.js');
// fixFile('api/get-color.js');
