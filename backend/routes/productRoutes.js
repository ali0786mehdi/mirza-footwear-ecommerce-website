const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
router.get('/', async (req, res) => {
    try {
        console.log("...Attempting to fetch products...");
        const products = await Product.find({});
        console.log("...Products fetched successfully:", products.length);
        res.json(products);
    } catch (error) {
        console.error("SERVER ERROR:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("SERVER ERROR (ID):", error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;