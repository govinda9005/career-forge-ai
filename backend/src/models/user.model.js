const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique:[true, 'Username already exists']},
    email: { type: String, required: true, unique:[true, 'Email already exists']},
    passwordHash: { type: String, required: true },
}, { timestamps: true });

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;