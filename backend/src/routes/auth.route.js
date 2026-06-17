const express = require('express');
const authController = require('../controllers/auth.controller');
const authRouter = express.Router();
const tokenBlacklistModel = require('../models/blacklist.model');
const authMiddleware = require('../middlewares/auth.middleware');


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */
authRouter.post('/login', authController.loginUserController);


/**
 * @route GET /api/auth/logout
 * @desc Clear the token from the user's cookies and add it to the blacklist
 * @access Private
 */
authRouter.get('/logout', authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @desc Get the current logged-in user's information based on the token in the cookies
 * @access Private
 */
authRouter.get('/get-me', authMiddleware.authUser,authController.getMeController);
    

module.exports = authRouter;