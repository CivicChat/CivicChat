const axios = require("axios");

async function translateText(text, toLang) {
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;

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

    return response.data[0].translations[0].text;
  } catch (err) {
    console.error("Translator error:", err);
    return text; // fallback: return original
  }
}

module.exports = { translateText };
