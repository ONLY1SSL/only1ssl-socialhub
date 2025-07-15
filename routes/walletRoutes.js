// routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');
const Product = require('../models/product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.userId }) || { balance: 0 };
  res.json({ balance: wallet.balance });
});

// Top-up wallet manually (for now)
router.post('/topup', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const wallet = await Wallet.findOneAndUpdate(
    { userId: req.userId },
    { $inc: { balance: amount }, $push: { transactions: { type: 'top-up', amount, description: 'Manual top-up' } } },
    { upsert: true, new: true }
  );

  res.json({ balance: wallet.balance });
});

// Purchase product
router.post('/purchase/:productId', authMiddleware, async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.available) return res.status(404).json({ error: 'Product not found' });

  const wallet = await Wallet.findOne({ userId: req.userId });
  if (!wallet || wallet.balance < product.price) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  wallet.balance -= product.price;
  wallet.transactions.push({
    type: 'purchase',
    amount: product.price,
    description: `Purchased ${product.name}`
  });
  await wallet.save();

  product.available = false;
  await product.save();

  res.json({ message: 'Purchase successful', balance: wallet.balance });
});

module.exports = router;
