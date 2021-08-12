const  dotenv = require('dotenv');
const Website = require('../models/Website')

const mongoose = require('mongoose')
dotenv.config();
const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    /// delete all documents
    await Website.deleteMany({});
    /// seed

    // user
    await Website.create([
      {
        name: 'batdongsan.com.vn',
        type: 'BATDONGSANVN',
        lastCrawDate: new Date()
      }
    ]);
   
  } catch (err) {
    console.log(err)
  }
  process.exit();
};

seed();
