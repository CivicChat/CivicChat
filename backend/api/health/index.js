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