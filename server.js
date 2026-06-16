require('dotenv').config(); // MUST BE LINE 1
const app = require('./src/app'); // Import our configured express app engine
const connectDB = require('./src/config/database');

// Connect to MongoDB Atlas
connectDB();

// Start network listener
app.listen(3000, () => {
    console.log('Server successfully running on port 3000');
});