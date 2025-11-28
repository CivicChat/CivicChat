// backend/api/routes/chat.js
const express = require("express");
const router = express.Router();

const { searchDocuments } = require("../services/AzureSearch");
const { generateAnswer } = require("../services/AzureOpenAI");

// POST /api/chat
router.post("/", async (req, res) => {
  const { message, lang, chatId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    // 1. Search Azure Cognitive Search index with the user's message
    const searchResults = await searchDocuments(message);

    // 2. Generate an answer using Azure OpenAI + the retrieved docs
    const answer = await generateAnswer({
      userMessage: message,
      lang: lang || "en",
      chatId: chatId || null,
      searchResults,
    });

    return res.json({ reply: answer });
  } catch (err) {
    console.error("Error in /api/chat:", err?.response?.data || err.message);
    return res.status(500).json({
      reply:
        "Sorry, something went wrong while contacting CivicChat's civic knowledge base.",
    });
  }
});

module.exports = router;
