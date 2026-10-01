const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // errors
  content = content.replace(/import \{.*?\} from "(\.\.\/)*middleware\/errors(\.js)?"/g, (match, p1, p2) => {
    return match.replace(/middleware\/errors(\.js)?/, 'common/errors/index.js');
  });

  // auth
  content = content.replace(/import \{.*?\} from "(\.\.\/)*middleware\/auth(\.js)?"/g, (match, p1, p2) => {
    return match.replace(/middleware\/auth(\.js)?/, 'common/middleware/auth.js');
  });

  // utils
  content = content.replace(/import (.*?) from "(\.\.\/)*utils\/(.*?)(\.js)?"/g, (match, p1, p2, p3, p4) => {
    if (p3.startsWith('seed')) return match; // skip seed utils
    return `import ${p1} from "${p2 ? p2 : './'}common/utils/${p3}.js"`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
    else if (fullPath.endsWith('.ts')) replaceInFile(fullPath);
  }
}

walk('backend/src');
