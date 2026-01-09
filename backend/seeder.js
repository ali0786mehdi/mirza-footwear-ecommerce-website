const mongoose = require('mongoose');
const dotenv = require('dotenv');
const products = require('./data/products');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // 1. Clear any old data
        await Product.deleteMany();

        // 2. Insert new data
        await Product.insertMany(products);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();