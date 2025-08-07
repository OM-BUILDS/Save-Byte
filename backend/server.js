const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const HttpError = require("./models/http-error");
const usersRoutes = require("./routes/user-routes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5001",
      "http://localhost:5173",
      "https://maps.googleapis.com/maps/api/distancematrix",
    ],
    methods: ["GET", "POST","PUT" ,"DELETE"],
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5001",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT","DELETE"],
    credentials: true,
  })
);

app.use("/api", (req, res, next) => {
  req.io = io; // Attach socket.io instance to request object
  usersRoutes(req, res, next);
});


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });


app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "An unknown error occurred!" });
});

io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId); 
      console.log(`📌 User ${userId} joined room ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
