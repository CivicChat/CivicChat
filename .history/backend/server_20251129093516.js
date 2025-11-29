// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRouter = require("./api/routes/chat");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`CivicChat backend running on port ${PORT}`);
});
