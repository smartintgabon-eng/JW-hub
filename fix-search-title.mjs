import fs from 'fs';
let content = fs.readFileSync('api/search-content.js', 'utf8');

content = content.replace(/metadata = firstValid;/g, 
`metadata = firstValid;
            if (firstValid.title) themeTitle = firstValid.title;`);
            
fs.writeFileSync('api/search-content.js', content);
