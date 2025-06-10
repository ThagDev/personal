// Script migrate dữ liệu categories từ parentId sang parentIds (graph)
// Chạy bằng: node scripts/migrate-categories-tree-to-graph.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'personal';

async function migrate() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const categories = db.collection('categories');

  // Update tất cả document: nếu có parentId thì thêm parentIds = [parentId], nếu không thì parentIds = []
  const cursor = categories.find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    let parentIds = [];
    if (doc.parentId) parentIds = [doc.parentId];
    await categories.updateOne({ _id: doc._id }, { $set: { parentIds } });
  }
  console.log('Migration completed!');
  await client.close();
}

migrate().catch(console.error);
