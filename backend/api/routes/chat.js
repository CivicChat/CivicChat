import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message, lang, chatId } = req.body;

  try {
    // Call Azure → your configured deployment
    const azureRes = await axios.post(
      process.env.AZURE_OPENAI_ENDPOINT + "/openai/deployments/civicchat/chat/completions?api-version=2024-06-01",
      {
        messages: [
          { role: "system", content: "You are CivicChat. You answer with DC election and civic data." },
          { role: "user", content: message }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY,
        },
      }
    );

    const reply = azureRes.data.choices[0].message.content;

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: "Error contacting Azure." });
  }
});

export default router;
