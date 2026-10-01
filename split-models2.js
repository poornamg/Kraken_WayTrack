const fs = require('fs');

const content = fs.readFileSync('backend/src/models/index.ts', 'utf8');

// The file has schemas, and then at the very end:
// export const User = model("User", userSchema)
// export const AuthHandoff = model("AuthHandoff", handoffSchema)
// ...

const lines = content.split('\n');

const exportsSection = lines.findIndex(l => l.startsWith('export const User = model'));

const definitions = lines.slice(0, exportsSection).join('\n');
const exportLines = lines.slice(exportsSection);

const sharedSchemas = `
const statusEventSchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { _id: false },
)

const addressSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    text: String,
  },
  { _id: false },
)

const orderItemSchema = new Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    weightKg: { type: Number, required: true },
    volumeM3: { type: Number, required: true },
    temperatureClass: { type: String, enum: ["ambient", "chilled", "frozen"] },
  },
  { _id: false },
)
`;

const files = {
  'User': 'userSchema',
  'AuthHandoff': 'handoffSchema',
  'Outlet': 'outletSchema',
  'Vehicle': 'vehicleSchema',
  'CalendarDay': 'calendarDaySchema',
  'Product': 'productSchema',
  'Order': 'orderSchema',
  'Trip': 'tripSchema',
  'LoadRecord': 'loadRecordSchema',
  'DeliveryRecord': 'deliveryRecordSchema',
  'TripLocation': 'locationSchema',
  'OperationalEvent': 'eventSchema',
  'FileAsset': 'fileAssetSchema',
  'IdempotencyRecord': 'idempotencySchema',
  'SyncReceipt': 'syncReceiptSchema'
};

const extracted = {};

// Clean definitions to find individual schemas
for (const [model, schema] of Object.entries(files)) {
  const startRegex = new RegExp(`const ${schema} = new Schema\\(`, 'm');
  const match = startRegex.exec(definitions);
  if (!match) {
    console.error(`Cannot find ${schema}`);
    continue;
  }
  const startIndex = match.index;
  // find next const ...Schema or end of definitions
  const nextMatch = definitions.substring(startIndex + 1).match(/\nconst \w+Schema = new Schema\(/);
  let endIndex = definitions.length;
  if (nextMatch) {
    endIndex = startIndex + 1 + nextMatch.index;
  }
  let schemaCode = definitions.substring(startIndex, endIndex).trim();

  // Any indexes
  const indexMatches = [...definitions.matchAll(new RegExp(`^${schema}\\.index.*`, 'gm'))];
  for (const im of indexMatches) {
    schemaCode += '\n' + im[0];
  }

  // Include shared schemas if needed
  let code = `import mongoose, { Schema, model } from "mongoose"\n`;
  if (model === 'Order' || model === 'Trip' || model === 'DeliveryRecord' || model === 'OperationalEvent') {
    code += sharedSchemas + '\n';
  } else if (model === 'Outlet' || model === 'TripLocation') {
    code += `const addressSchema = new Schema({ lat: { type: Number, required: true }, lng: { type: Number, required: true }, text: String }, { _id: false })\n`;
  }
  
  if (model === 'User') {
    code += `import { ROLES } from "../common/constants/roles.js"\n`;
  }

  code += `\n${schemaCode}\n\n`;
  code += `export const ${model} = model("${model}", ${schema})\n`;
  extracted[model] = code;
}

for (const [model, code] of Object.entries(extracted)) {
  fs.writeFileSync(`backend/src/models/${model}.ts`, code);
}

const indexCode = `
export * from "./unifiedOrder.js"
${Object.keys(files).map(f => `export * from "./${f}.js"`).join('\n')}
`;
fs.writeFileSync('backend/src/models/index.ts', indexCode);
