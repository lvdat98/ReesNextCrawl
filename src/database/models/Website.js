/* eslint-disable func-names */
const mongoose =  require ('mongoose');

let WebsiteSchema = new mongoose.Schema(
  {
    lastCrawDate: Date,
    lastCrawUrl: String,
    name: String,
    type: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports =  mongoose.model('websites', WebsiteSchema);
