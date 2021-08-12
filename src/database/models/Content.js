/* eslint-disable func-names */
const mongoose =  require ('mongoose');

const ContentSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'websites',
    },
    images: [{ type: String }],
    title: String,
    address: String,
    totalPrice: String,
    unitPrice: Number,
    acreage: String,
    description: String,
    keyWords: [String],
    publishDate: String,
    expirationDate: String,
    type: String,
    phone: String,
    url: String
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


module.exports = mongoose.model('contents', ContentSchema);
