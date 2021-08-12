const  dotenv = require('dotenv');
const mongoose = require('mongoose')
dotenv.config();
const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('Connection with database succeeded.')
  } catch (err) {
    console.error(err)
  }
}

exports.connect = connect