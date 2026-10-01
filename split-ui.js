const fs = require('fs');
const content = fs.readFileSync('frontend/loader/src/components/loader-ui.tsx', 'utf8');

const nodes = [];
let currentCode = [];
let currentName = 'imports';
let isType = false;

const lines = content.split('\n');
for (const line of lines) {
  const funcMatch = line.match(/^export function (\w+)/);
  const typeMatch = line.match(/^export (type|interface) (\w+)/);
  
  if (funcMatch || typeMatch) {
    if (currentCode.length > 0) {
      nodes.push({ name: currentName, code: currentCode.join('\n'), isType });
    }
    currentCode = [line];
    currentName = funcMatch ? funcMatch[1] : typeMatch[2];
    isType = !!typeMatch;
  } else {
    currentCode.push(line);
  }
}
if (currentCode.length > 0) {
  nodes.push({ name: currentName, code: currentCode.join('\n'), isType });
}

fs.writeFileSync('nodes.json', JSON.stringify(nodes, null, 2));
