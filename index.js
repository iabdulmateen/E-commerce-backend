
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admin-room");
    console.log("Admin joined admin-room");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Connect to MongoDB before processing API requests
let dbConnectionPromise;

app.use(async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;
    next();
  } catch (error) {
    dbConnectionPromise = null;
    next(error);
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "E-commerce REST API is running successfully",
    database: "MongoDB connection required",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      orders: "/api/orders",
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error("[API Error]:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: statusCode === 500
      ? "Internal Server Error"
      : err.message,
  });
});

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export HTTP server so Vercel can handle Express + Socket.IO
module.exports = server;
