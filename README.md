# CivicChat — AI-Powered Local Election & Government Assistant  
### Microsoft Innovation Challenge 2025 Submission  

---
![civic chat logo and tagline](intro.jpeg)

## Overview  
CivicChat is an AI-powered assistant that helps people understand **local elections, ballot measures, and community services** using plain, accessible language.  
For this MVP, we focus on **Washington, DC**, using **official government data only** to ensure neutrality and accuracy. Users can ask questions in everyday language, and our system searches real government data using Azure Cognitive Search, summarizes it with Azure OpenAI, and gives clear, neutral explanations. It's designed to help communities access civic information quickly, safely, and without misinformation.

## Vision
Millions of Americans struggle to understand local government structures, who represents them, how elections work, and how to navigate city services.
CivicChat provides:

- Transparent election information
- Clear explanations of local/state/federal government roles
- Guidance on city services (311, speed bumps, trash pickup, etc.)
- Accessible civic education for multilingual communities
- Grounded answers with verified sources

Our goal is to make civic knowledge universally accessible, accurate, and local.

Residents can ask questions like:
- “Who are the candidates for Mayor?”  
- “How does ranked-choice voting work in DC?”  
- “How do I report a pothole?”  
- “Explain this ballot question to me simply.”

All content is available in **multiple languages**, supporting immigrant communities and those with language barriers.

---

## Key Features  
### Election & Ballot Explanations  
Summaries of ballot measures and candidate information grounded in official documents.

### Azure AI Search Indexing  
All scraped civic data is processed and indexed in Azure AI Search for fast, reliable retrieval.

### GPT-4 mini Summarization  
Answers are generated through GPT-4 mini using a RAG pipeline (Retrieval-Augmented Generation).

### Multilingual Support  
Users can switch between multiple languages with one click.

### Government Service Guidance  
Explains roles of agencies and helps residents navigate services (e.g., transportation, public works).
##Core Chat Experience
- Natural-language chat interface
- Suggested starter questions
- Chat history saved locally
- Clean, modern UI with sidebar navigation
- Autoscrolling conversation window

## AI Reasoning + Grounding
- Retrieval-Augmented Generation (RAG)
- Sources displayed under bot messages
- Secure, neutral civic explanations

##Civic Datasets

- Includes structured JSON knowledge base for:
- Local DC government (mayor, council, ANCs, wards)
- Elections & voting (registration, early voting, ballots)
- Federal relationships (Home Rule, statehood, Congress oversight)
- City services (DDOT, 311, trash, speed bumps, DMV)

## Azure-native Cloud Architecture
- Azure Static Web Apps (React)
- Azure Container Apps (Node.js backend)
- Azure Cognitive Search (semantic index)
- Azure Blob Storage (dataset storage & indexing)
- Azure OpenAI (GPT-4o model)
- Azure Translator
- Azure Key Vault
---

## System Architecture  
1. **Scrapers** collect official civic data from government sites.  
2. **Data Processing** converts raw data into structured civic records.  
3. **Azure AI Search** indexes all civic data.  
4. **Backend API** retrieves search results.  
5. **GPT-4 mini** summarizes content into clear, neutral responses.  
6. **Frontend Web App** provides a clean, simple chat interface with language switching.

Architecture diagram available in `/docs/architecture.png`.

---

## Tech Stack  
### **AI + Search**
- Azure OpenAI GPT-4 mini  
- Azure Cognitive Search  

### **Data**
- Custom web scrapers  
- Official government sites (elections, agencies, public notices)

### **Frontend**
- React
- Chat-style UI  
- Multilingual toggle

### **Backend**
- Node.js (via npm)  
- REST API for search + chat

---

## Run Locally  
**Backend**  
cd backend
npm install
npm start

**Frontend**  
cd frontend
npm install
npm start

yaml
Copy code

---

## Data Sources  
All data is scraped from **official government sites**, including:  
- DC Board of Elections  
- DC.gov agencies  
- Municipality pages (public services)

No third-party or unverified data sources are used.

---

## Next Steps Roadmap  
- Expand beyond DC to all U.S. states  
- Add voice support via Azure Speech  
- Add PDF ingestion via Azure Document Intelligence  
- Add user personalization and accessibility features  
- Deploy as a mobile-friendly progressive web app

# Responsible AI Statement — CivicChat  

CivicChat follows responsible AI principles to ensure accuracy, neutrality, and accessibility in civic information.

## 1. Data Integrity  
All data comes directly from **official government websites** such as the DC Board of Elections and DC.gov agencies.  
We do not use crowdsourced, partisan, or unofficial documents.

## 2. Neutrality  
CivicChat does not endorse candidates or political views.  
All responses are grounded in factual civic documents retrieved through **Azure AI Search**, preventing generation of unsupported claims.

## 3. Reducing Hallucinations  
We use Retrieval-Augmented Generation (RAG) with Azure:  
- Search results from Azure AI Search are passed into GPT-4 mini  
- The model is instructed to answer **only** using retrieved documents  
- If data is missing, the assistant clearly states:  
  *“I do not have enough information to answer that.”*

## 4. Transparency  
CivicChat explains where information comes from and avoids speculation.  
Summaries reflect the content of official documents, not the model’s opinions.

## 5. Multilingual Fairness  
Multilingual responses are generated consistently using the same retrieval data, ensuring equal access across languages.  
We avoid cultural or political assumptions in translated content.

## 6. User Privacy  
CivicChat does not collect, store, or profile personal data.  
User queries are processed transiently and are not used for training or analytics.

## 7. Accessibility  
We design for linguistic and cognitive accessibility by simplifying complex civic jargon into clear, beginner-friendly explanations.
CivicChat’s goal is to increase civic participation responsibly, safely, and transparently.

