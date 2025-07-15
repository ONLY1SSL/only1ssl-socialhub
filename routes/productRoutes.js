// routes/productRoutes.js
const express = require('express');
const router = express.router();
const product = require('../models/product');

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await product.find({ available: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
