const express = require("express");
const cors = require("cors");

// Import your router logic (for local dev only)
const chatRouter = require("./api/routes/chat");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/chat", chatRouter);

// Health check route for local dev
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    envVars: {
      OPENAI: !!process.env.AZURE_OPENAI_API_KEY,
      SEARCH: !!process.env.AZURE_SEARCH_API_KEY,
      TRANSLATOR: !!process.env.AZURE_TRANSLATOR_KEY,
    },
  });
});

app.listen(PORT, () => {
  console.log(`[CivicChat] Backend running locally on port ${PORT}`);
});