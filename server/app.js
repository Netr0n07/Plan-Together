const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set Content-Type for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
