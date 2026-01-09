const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'mirzasecret', {
        expiresIn: '30d', // Token works for 30 days
    });
};

module.exports = generateToken;