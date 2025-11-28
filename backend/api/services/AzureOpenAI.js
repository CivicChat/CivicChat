// backend/services/AzureOpenAI.js
const axios = require("axios");
require("dotenv").config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

if (!endpoint || !apiKey || !deployment) {
  console.error("Azure OpenAI env vars missing. Check .env file.");
}

async function generateAnswer({ userMessage, lang, searchResults }) {
  try {
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

    const contextText = searchResults
      .map((doc, i) => `DOC ${i + 1}: ${JSON.stringify(doc)}`)
      .join("\n\n");

    const response = await axios.post(
      url,
      {
        messages: [
          {
            role: "system",
            content: `You are CivicChat, a civic information assistant. Use ONLY the following documents as your source of truth:\n\n${contextText}`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    return answer;
  } catch (err) {
    console.error("Azure OpenAI error:", err.response?.data || err.message);
    return "Error contacting Azure OpenAI.";
  }
}

module.exports = {
  generateAnswer,
};
