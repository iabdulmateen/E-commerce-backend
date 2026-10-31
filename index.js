const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Database Connect
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'API is running successfully...' });
});

// Yahan apne routes link karein (e.g. app.use('/api/products', require('./routs/productRoute'))

// Database offline fallback error handler
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('Database offline — returning fallback');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Database service offline' });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});