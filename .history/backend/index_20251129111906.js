const { searchDocuments } = require("../services/AzureSearch");
const { generateAnswer } = require("../services/AzureOpenAI");

module.exports = async function (context, req) {
  context.log("Received /api/chat request:", req.body);
  const { message, lang, chatId } = req.body || {};

  if (!message) {
    context.res = { status: 400, body: { reply: "No message provided." } };
    return;
  }

  try {
    const searchResults = await searchDocuments(message);
    const answer = await generateAnswer({
      userMessage: message,
      lang: lang || "en",
      chatId: chatId || null,
      searchResults,
    });

    context.res = { status: 200, body: { reply: answer } };
  } catch (err) {
    context.log.error("Error in /api/chat:", err);
    context.res = { status: 500, body: { reply: "Service error." } };
  }
};
module.exports = async function (context, req) {
  context.res = {
    status: 200,
    body: {
      status: "ok",
      nodeVersion: process.version,
      envVars: {
        OPENAI: !!process.env.AZURE_OPENAI_API_KEY,
        SEARCH: !!process.env.AZURE_SEARCH_API_KEY,
        TRANSLATOR: !!process.env.AZURE_TRANSLATOR_KEY
      }
    }
  };
};