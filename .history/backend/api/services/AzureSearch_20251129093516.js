// backend/services/AzureSearch.js
const { AzureKeyCredential, SearchClient } = require("@azure/search-documents");
require("dotenv").config();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiKey = process.env.AZURE_SEARCH_API_KEY;

// Safety check
if (!endpoint || !indexName || !apiKey) {
  console.error("❌ Azure Search env vars missing. Check .env file.");
}

const searchClient = new SearchClient(
  endpoint,
  indexName,
  new AzureKeyCredential(apiKey)
);

async function searchDocuments(query) {
  try {
    const results = [];
    const search = await searchClient.search(query, {
      top: 5,
      includeTotalCount: true
    });

    for await (const result of search.results) {
      results.push(result.document);
    }

    return results;
  } catch (err) {
    console.error("Azure Search error:", err);
    return [];
  }
}

module.exports = {
  searchDocuments,
};
