const fs = require('fs');
const content = fs.readFileSync('backend/src/models/index.ts', 'utf8');

const imports = content.match(/^import .*?\n/gm).join('');

const blocks = content.split('\n\n');
const files = {
  'User.ts': 'userSchema',
  'AuthHandoff.ts': 'handoffSchema',
  'Outlet.ts': 'outletSchema',
  'Vehicle.ts': 'vehicleSchema',
  'CalendarDay.ts': 'calendarDaySchema',
  'Product.ts': 'productSchema',
  'Order.ts': 'orderSchema',
  'Trip.ts': 'tripSchema',
  'LoadRecord.ts': 'loadRecordSchema',
  'DeliveryRecord.ts': 'deliveryRecordSchema',
  'TripLocation.ts': 'locationSchema',
  'OperationalEvent.ts': 'eventSchema',
  'FileAsset.ts': 'fileAssetSchema',
  'IdempotencyRecord.ts': 'idempotencySchema',
  'SyncReceipt.ts': 'syncReceiptSchema'
};

const extracted = {};

let indexExports = [];

for (const [file, schema] of Object.entries(files)) {
  let schemaBlock = blocks.find(b => b.includes(`const ${schema} = new Schema`));
  let exportLine = blocks.find(b => b.includes(`export const ${file.replace('.ts', '')} = model`));
  
  if (file === 'User.ts') {
    // User schema also needs Role import if we extracted it, wait, ROLES is in common/constants/roles
    // Just inject import { Role } from "../common/constants/roles.js"
  }

  extracted[file] = `import { Schema, model } from "mongoose"\nimport { Role } from "../common/constants/roles.js"\n\n${schemaBlock}\n\n${exportLine}\n`;
  indexExports.push(`export * from "./${file.replace('.ts', '.js')}"`);
}

for (const [file, code] of Object.entries(extracted)) {
  fs.writeFileSync(`backend/src/models/${file}`, code);
}

fs.writeFileSync('backend/src/models/index.ts', `// Re-exports
export * from "./unifiedOrder.js"
${indexExports.join('\n')}
`);
