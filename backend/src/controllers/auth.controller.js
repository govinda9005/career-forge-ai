const userModel = require('../models/user.model');
const tokenBlacklistModel = require('../models/blacklist.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @name registerUserController
 * @desc register a new user, expects username, email and password in the request body
 * @access Public
 * */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] });

        if (isUserAlreadyExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            email,
            passwordHash: hashedPassword,
        });

        // 1. Persist user data first
        await newUser.save();

        // 2. Generate the token AFTER a successful save operation
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 3. Configure robust cookie options
        const cookieOptions = {
            httpOnly: true,                                       // Protects against XSS attacks
            secure: process.env.NODE_ENV === 'production',        // Requires HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Handles cross-origin requests
            maxAge: 24 * 60 * 60 * 1000                           // 1 day expiration in milliseconds
        };

        // 4. Send ONE response containing cookie configurations and json data
        return res.cookie('token', token, cookieOptions).status(201).json({ 
            message: 'User registered successfully', 
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                email: newUser.email 
            } 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
}

/**
 * @name loginUserController
 * @desc login a user, expects email and password in the request body
 * @access Public
 * */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        };

        return res.cookie('token', token, cookieOptions).status(200).json({ 
            message: 'User logged in successfully', 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server login error' });
    }
}

/**
 * @name logoutUserController
 * @desc clear the token from the user's cookies and add it to the blacklist
 * @access Private
 */

async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token });
    }    

    res.clearCookie('token').status(200).json({ message: 'User logged out successfully' });
}

/**
 * @name getMeController
 * @desc Get the current logged-in user's information.
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user:{
        id: user._id,
        username: user.username,
        email: user.email
    } });
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };