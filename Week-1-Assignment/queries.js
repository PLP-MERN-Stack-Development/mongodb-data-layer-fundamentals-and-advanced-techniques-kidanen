// queries.js - CRUD, Advanced Queries, Aggregation, Indexing
const mongoose = require('mongoose');
require('dotenv').config();

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  published_year: Number,
  price: Number,
  in_stock: Boolean,
  pages: Number,
  publisher: String
});

const Book = mongoose.model('Book', bookSchema);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plp_bookstore';

async function runQueries() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    /* --- Task 2: Basic CRUD --- */
    console.log('--- Task 2: CRUD ---');

    const fictionBooks = await Book.find({ genre: 'Fiction' });
    console.log('📚 Fiction Books:', fictionBooks);

    const after1950 = await Book.find({ published_year: { $gt: 1950 } });
    console.log('\n📅 Books after 1950:', after1950);

    const orwellBooks = await Book.find({ author: 'George Orwell' });
    console.log('\n✍️ Orwell Books:', orwellBooks);

    await Book.updateOne({ title: 'The Hobbit' }, { $set: { price: 15.99 } });
    console.log('\n💰 Updated Hobbit Price');

    await Book.deleteOne({ title: 'Moby Dick' });
    console.log('🗑️ Deleted Moby Dick');

    /* --- Task 3: Advanced Queries --- */
    console.log('\n--- Task 3: Advanced Queries ---');

    const recentInStock = await Book.find({ in_stock: true, published_year: { $gt: 2010 } });
    console.log('📦 Recent In-Stock:', recentInStock);

    const projectionBooks = await Book.find({}, { title: 1, author: 1, price: 1, _id: 0 });
    console.log('🎯 Projection:', projectionBooks);

    const ascBooks = await Book.find().sort({ price: 1 });
    console.log('⬆️ Asc Price:', ascBooks);

    const descBooks = await Book.find().sort({ price: -1 });
    console.log('⬇️ Desc Price:', descBooks);

    const page = 2, limit = 5;
    const paginated = await Book.find().skip((page - 1) * limit).limit(limit);
    console.log(`📖 Page ${page} Books:`, paginated);

    /* --- Task 4: Aggregation --- */
    console.log('\n--- Task 4: Aggregations ---');

    const avgPriceByGenre = await Book.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' } } }
    ]);
    console.log('📊 Avg Price by Genre:', avgPriceByGenre);

    const topAuthor = await Book.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    console.log('🏆 Top Author:', topAuthor);

    const booksByDecade = await Book.aggregate([
      { $addFields: { decade: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] } } },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('📆 Books by Decade:', booksByDecade);

    /* --- Task 5: Indexing --- */
    console.log('\n--- Task 5: Indexing ---');

    await Book.collection.createIndex({ title: 1 });
    console.log('⚡ Index on title created');

    await Book.collection.createIndex({ author: 1, published_year: -1 });
    console.log('⚡ Compound index on author+year created');

    const explain = await Book.find({ title: '1984' }).explain('executionStats');
    console.log('🔎 Explain Plan:', explain.executionStats);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

runQueries();
