const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[Server] Failed to connect to database: ${error.message}`);
    // Still start Express server so health endpoints and graceful messaging can operate
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} (Database pending connection)`);
    });
  }
};

startServer();
