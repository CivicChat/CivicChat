const axios = require("axios");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = "2024-08-01-preview";

if (!endpoint || !apiKey || !deployment) {
  console.error("[AzureOpenAI] Missing required environment variables.");
}

async function generateAnswer({ userMessage, lang = "en", chatId = null, searchResults = [] }) {
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const contextText = searchResults
    .map((doc, i) => `DOC ${i + 1}: ${JSON.stringify(doc)}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content: `You are CivicChat, a civic information assistant. Use ONLY the following documents as your source of truth:\n\n${contextText}`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const response = await axios.post(
      url,
      { messages, temperature: 0.2 },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const answer = response.data?.choices?.[0]?.message?.content;
    return answer || "No response from Azure OpenAI.";
  } catch (err) {
    console.error("[AzureOpenAI] Error:", err.response?.data || err.message);
    return "Error contacting Azure OpenAI.";
  }
}

module.exports = {
  generateAnswer,
};