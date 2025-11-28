// backend/api/services/azureSearch.js
const axios = require("axios");

const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT; // 
const searchIndexName = process.env.AZURE_SEARCH_INDEX_NAME; // 
const searchApiKey = process.env.AZURE_SEARCH_API_KEY; // admin or query key

if (!searchEndpoint || !searchIndexName || !searchApiKey) {
  console.warn(
    "⚠️ Azure Search env vars missing. Check AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_INDEX_NAME, AZURE_SEARCH_API_KEY."
  );
}

/**
 * Search Azure Cognitive Search for relevant KB docs.
 * @param {string} query - user question
 * @param {number} top - number of docs to return
 * @returns {Promise<Array>} array of documents
 */
async function searchDocuments(query, top = 5) {
  const url = `${searchEndpoint}/indexes/${searchIndexName}/docs/search?api-version=2023-07-01-Preview`;

  const payload = {
    search: query,
    top,
    queryType: "semantic", // if index supports semantic
    semanticConfiguration: process.env.AZURE_SEARCH_SEMANTIC_CONFIG || undefined,
    queryLanguage: "en-us",
  };

  const headers = {
    "Content-Type": "application/json",
    "api-key": searchApiKey,
  };

  const response = await axios.post(url, payload, { headers });

  const hits = response.data?.value || [];

  // Normalize to simple structure used by OpenAI prompt
  return hits.map((doc) => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    tags: doc.tags,
    content: doc.content,
    sources: doc.sources,
  }));
}

module.exports = {
  searchDocuments,
};

