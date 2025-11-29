const { AzureKeyCredential, SearchClient } = require("@azure/search-documents");

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiKey = process.env.AZURE_SEARCH_API_KEY;

// Safety check
if (!endpoint || !indexName || !apiKey) {
  console.error("[AzureSearch]  Missing required environment variables.");
}

let searchClient;
try {
  searchClient = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
} catch (err) {
  console.error("[AzureSearch] Failed to initialize SearchClient:", err.message);
}

async function searchDocuments(query) {
  if (!searchClient) {
    console.error("[AzureSearch] SearchClient not initialized.");
    return [];
  }

  try {
    const results = [];
    const search = await searchClient.search(query, {
      top: 5,
      includeTotalCount: true,
    });

    for await (const result of search.results) {
      results.push(result.document);
    }

    return results;
  } catch (err) {
    console.error("[AzureSearch] Error during search:", err.response?.data || err.message);
    return [];
  }
}

module.exports = {
  searchDocuments,
};