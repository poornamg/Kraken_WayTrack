const fs = require('fs');

const original = fs.readFileSync('backend/src/models/index.ts.bak', 'utf8').split('\n');

function getBlock(name) {
  const startRegex = new RegExp(`const ${name} = new Schema\\(`, 'm');
  const definitions = fs.readFileSync('backend/src/models/index.ts.bak', 'utf8');
  const match = startRegex.exec(definitions);
  if (!match) return '';
  const startIndex = match.index;
  const nextMatch = definitions.substring(startIndex + 1).match(/\nconst \w+Schema = new Schema\(/);
  let endIndex = definitions.length;
  if (nextMatch) endIndex = startIndex + 1 + nextMatch.index;
  return definitions.substring(startIndex, endIndex).trim();
}

function prepend(file, name) {
  let content = fs.readFileSync(file, 'utf8');
  const block = getBlock(name);
  content = content.replace('const ', `${block}\n\nconst `);
  fs.writeFileSync(file, content);
}

prepend('backend/src/models/Trip.ts', 'stopSchema');
prepend('backend/src/models/Trip.ts', 'ruleSchema');
prepend('backend/src/models/LoadRecord.ts', 'loadItemSchema');
prepend('backend/src/models/DeliveryRecord.ts', 'deliveryItemSchema');

