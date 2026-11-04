const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
// Import Route handlers
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined admin-room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
// CORS Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());

// Database Connection
connectDB();

// API Root Overview Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'E-commerce REST API is running successfully',
    database: process.env.MONGO_URI ? 'MongoDB Atlas (Configured)' : 'In-Memory / Offline Fallback Active',
    endpoints: {
      auth: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile (Bearer Token)',
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products (Admin)',
        update: 'PUT /api/products/:id (Admin)',
        delete: 'DELETE /api/products/:id (Admin)',
      },
      orders: {
        create: 'POST /api/orders (Protected)',
        myOrders: 'GET /api/orders/myorders (Protected)',
        getById: 'GET /api/orders/:id (Protected)',
      },
    },
  });
});

// Mount API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Database offline & general error fallback middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message);

  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    (err.message && err.message.includes('buffering timed out'))
  ) {
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Database service offline. Please verify Atlas connection.' });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});
const PORT = process.env.PORT || 4000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});