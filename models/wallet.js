// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String }, // 'top-up' or 'purchase'
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Wallet', walletSchema);
