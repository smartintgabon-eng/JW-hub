import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Replace the wrapper
content = content.replace(/const webReq = createWebRequest\(req\);\s*const handler = getHandler\(handlerModule\);\s*const webRes = await handler\(webReq\);\s*await handleWebResponse\(webRes, res\);/g, 
"const handler = getHandler(handlerModule);\n      await handler(req, res);");

fs.writeFileSync('server.ts', content);
