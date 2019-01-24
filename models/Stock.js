const mongoose = require('mongoose'),
      arrayUniquePlugin = require('mongoose-unique-array');

const StockSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  likesList: [String],
  lastUpdated: {
    type: Date,
    default: Date.now()
  }
});

StockSchema.plugin(arrayUniquePlugin);
module.exports = mongoose.model('stock', StockSchema);