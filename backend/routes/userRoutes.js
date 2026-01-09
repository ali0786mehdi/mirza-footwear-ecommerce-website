const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token (LOGIN)
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id), // Give the wristband
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Register a new user
// @route   POST /api/users
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

module.exports = router;