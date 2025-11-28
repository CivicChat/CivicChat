// backend/api/services/azureOpenAI.js
const axios = require("axios");

const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT; 
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;
const openaiDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME; 
const openaiApiVersion =
  process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

if (!openaiEndpoint || !openaiApiKey || !openaiDeployment) {
  console.warn(
    "⚠️ Azure OpenAI env vars missing. Check AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT_NAME."
  );
}

/**
 * Generate an answer using Azure OpenAI + retrieved search results.
 * @param {Object} params
 * @param {string} params.userMessage
 * @param {string} params.lang - language code like 'en'
 * @param {string|null} params.chatId
 * @param {Array} params.searchResults - array of docs from Azure Search
 * @returns {Promise<string>} model answer
 */
async function generateAnswer({ userMessage, lang, chatId, searchResults }) {
  // Build context from KB docs
  const contextText = searchResults
    .map((doc, idx) => {
      const src = doc.sources && doc.sources.length ? doc.sources.join(", ") : "";
      return `Document ${idx + 1}:
Title: ${doc.title}
Category: ${doc.category}
Tags: ${Array.isArray(doc.tags) ? doc.tags.join(", ") : ""}
Content: ${doc.content}
Sources: ${src}`;
    })
    .join("\n\n");

  const systemPrompt = `
You are CivicChat, an AI assistant that helps people understand Washington DC elections, ballot items, local government, city services, and the difference between local, state, and federal government.

Use ONLY the information in the provided documents when answering. 
If the documents do not contain an answer, say you don't have that information and suggest where they might find it (such as the DC Board of Elections, DC Council, or official DC government websites). 
Keep answers brief, clear, and non-partisan. 
If the user is asking about how to contact an official or request a city service, point them to 311 or the relevant DC agency from the context.
Language code: ${lang || "en"}.
`;

  const messages = [
    {
      role: "system",
      content: systemPrompt.trim(),
    },
    {
      role: "user",
      content: `User question: "${userMessage}"

Here are relevant documents from the CivicChat knowledge base:
${contextText || "(no documents found)"}
`,
    },
  ];

  const url = `${openaiEndpoint}/openai/deployments/${openaiDeployment}/chat/completions?api-version=${openaiApiVersion}`;

  const payload = {
    messages,
    temperature: 0.2,
    max_tokens: 512,
    top_p: 0.95,
  };

  const headers = {
    "Content-Type": "application/json",
    "api-key": openaiApiKey,
  };

  const response = await axios.post(url, payload, { headers });

  const choice = response.data?.choices?.[0];
  const content = choice?.message?.content?.trim();

  return content || "I wasn't able to generate an answer.";
}

module.exports = {
  generateAnswer,
};

