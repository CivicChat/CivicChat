// backend/api/routes/chat.js
const express = require("express");
const router = express.Router();

const { searchDocuments } = require("../services/AzureSearch");
const { generateAnswer } = require("../services/AzureOpenAI");

// Test route
router.get("/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Chat API test route working!",
  });
});

// Main chat route
router.post("/", async (req, res) => {
  console.log("Received /api/chat request:", req.body);

  const { message, lang, chatId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    // 1. Search Azure Cognitive Search
    const searchResults = await searchDocuments(message);

    // 2. Generate answer via Azure OpenAI
    const answer = await generateAnswer({
      userMessage: message,
      lang: lang || "en",
      chatId: chatId || null,
      searchResults,
    });

    return res.json({ reply: answer });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return res.status(500).json({
      reply: "Sorry, something went wrong while contacting CivicChat's services.",
    });
  }
});

module.exports = router;
