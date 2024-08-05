import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import AppRoutes from "./src/routes/user.js";
import { createServer } from "http";
import { Server } from "socket.io";
import userModel from "./src/models/user.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// Set up the routes
app.use("/user", AppRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let connectedUsers = [];

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("addUser", async (userId) => {
    try {
      if (!userId) return;
      const existingUser = await userModel.findById(userId);
      
      if (existingUser) {
        // Remove any existing socket ID for this user
        connectedUsers = connectedUsers.filter(user => user.userId._id !== userId);
        // Add the new socket ID
        connectedUsers.push({ 
          userId, // Only store userId, not sensitive details
          socketId: socket.id 
        });

        // Emit the updated list of connected users
        io.emit("getUsers", connectedUsers);
      }
    } catch (err) {
      console.error("Error handling addUser event:", err);
    }
  });

  socket.on("disconnect", () => {
    // Remove the socket ID for the disconnected user
    connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);

    // Emit the updated list of connected users
    io.emit("getUsers", connectedUsers);
    console.log("User disconnected", socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
