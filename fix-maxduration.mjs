import fs from 'fs';

function addMaxDuration(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('maxDuration')) {
    content = "export const maxDuration = 60;\n" + content;
    fs.writeFileSync(file, content);
  }
}

addMaxDuration('api/generate-content.js');
addMaxDuration('api/search-content.js');
