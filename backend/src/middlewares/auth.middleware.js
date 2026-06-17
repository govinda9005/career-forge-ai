const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

function authUser(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Check if the token is blacklisted
        tokenBlacklistModel.findOne({ token }, (err, blacklistedToken) => {
            if (err) {
                console.error('Error checking token blacklist:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (blacklistedToken) {
                return res.status(401).json({ message: 'Token has been blacklisted' });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Invalid token' });
                }            

                req.user = decoded;
                next();
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { authUser };