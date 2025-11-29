const axios = require("axios");

const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const key = process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.AZURE_TRANSLATOR_REGION;

// Safety check
if (!endpoint || !key || !region) {
  console.error("[AzureTranslator]  Missing required environment variables.");
}

async function translateText(text, toLang = "en") {
  if (!endpoint || !key || !region) {
    console.error("[AzureTranslator] Environment variables not set, returning original text.");
    return text;
  }

  const url = `${endpoint}/translate?api-version=3.0&to=${toLang}`;

  try {
    const response = await axios.post(
      url,
      [{ Text: text }],
      {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
      }
    );

    const translated = response.data?.[0]?.translations?.[0]?.text;
    return translated || text; // fallback if translation fails
  } catch (err) {
    console.error("[AzureTranslator] Error:", err.response?.data || err.message);
    return text; // fallback: return original
  }
}

module.exports = { translateText };