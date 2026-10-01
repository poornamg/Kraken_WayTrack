const fs = require('fs');

function replace(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

replace('backend/src/app.ts', /"\.\/middleware\/auth\.js"/g, '"./common/middleware/auth.js"');
replace('backend/src/app.ts', /"\.\/middleware\/errors\.js"/g, '"./common/errors/index.js"');
replace('backend/src/app.ts', /"\.\/utils\/response\.js"/g, '"./common/utils/response.js"');
replace('backend/src/app.ts', /error\.statusCode/g, '(error.statusCode || 500)');
replace('backend/src/app.ts', /error\.details/g, '(error as any).details');

replace('backend/src/common/middleware/auth.ts', /"\.\/errors\.js"/g, '"../errors/index.js"');
replace('backend/src/common/middleware/auth.ts', /"\.\.\/models\/index\.js"/g, '"../../models/index.js"');
replace('backend/src/common/utils/audit.ts', /"\.\.\/models\/index\.js"/g, '"../../models/index.js"');
replace('backend/src/common/utils/idempotency.ts', /"\.\.\/common\/errors\/index\.js"/g, '"../errors/index.js"');
replace('backend/src/common/utils/idempotency.ts', /"\.\.\/models\/index\.js"/g, '"../../models/index.js"');
replace('backend/src/common/utils/time.ts', /"\.\.\/common\/errors\/index\.js"/g, '"../errors/index.js"');
replace('backend/src/common/utils/version.ts', /"\.\.\/common\/errors\/index\.js"/g, '"../errors/index.js"');

