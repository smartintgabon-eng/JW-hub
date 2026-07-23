import fs from 'fs';

let content = fs.readFileSync('api/generate-content.js', 'utf8');

// The issue: "Les Témoins de Jéhovah : site officiel. Page introuvable"
// The problem is that axios is not correctly escaping or using the URL, or JW.org requires specific headers, or block bot User-Agents.

content = content.replace(/const scraperAxios = axios\.create\(\{\s*timeout: 45000,\s*\}\);/g, 
`const scraperAxios = axios.create({
  timeout: 45000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
  }
});`);

fs.writeFileSync('api/generate-content.js', content);
