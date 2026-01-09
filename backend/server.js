const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- IMPORTS FOR ROUTES ---
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // <--- NEW LINE 1 (Import the file)

dotenv.config();
connectDB();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Allows server to accept JSON data in body
app.use(cors());

// --- MOUNT ROUTES ---
// This tells the server: "If URL starts with /api/products, go to productRoutes"
app.use('/api/products', productRoutes);

// This tells the server: "If URL starts with /api/users, go to userRoutes"
app.use('/api/users', userRoutes); // <--- NEW LINE 2 (Connect the route)


// --- BASIC TEST ROUTE ---
app.get('/', (req, res) => {
    res.send('API is running... Mirza Footwear Backend is Live!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});