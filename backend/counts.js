const { connectDatabase, disconnectDatabase } = require('./dist/config/connection.js');
const { loadConfig } = require('./dist/config/env.js');
const mongoose = require('mongoose');
async function run() {
  await connectDatabase('mongodb://localhost:27017/waylink?replicaSet=rs0');
  const collections = await mongoose.connection.db.listCollections().toArray();
  const counts = {};
  for (const c of collections) {
    counts[c.name] = await mongoose.connection.db.collection(c.name).countDocuments();
  }
  console.log(JSON.stringify(counts, null, 2));
  await disconnectDatabase();
}
run();
