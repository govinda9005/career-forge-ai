const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.route');

const app = express();
app.use(cookieParser());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

module.exports = app;