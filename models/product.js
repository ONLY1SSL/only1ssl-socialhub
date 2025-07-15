// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true }, // e.g. Instagram, Facebook
  price: { type: Number, required: true }, // in Naira
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('product', productSchema);
