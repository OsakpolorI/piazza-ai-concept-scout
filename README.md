# Piazza AI Concept Scout

**A context-aware research assistant for CS1 students, integrated directly into the Piazza interface.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://piazza-ai-demo.vercel.app) [![Backend API](https://img.shields.io/badge/API-https%3A%2F%2Fpiazza--scout.duckdns.org-blue)](https://piazza-scout.duckdns.org)

---

## 🚀 Project Overview

**Piazza AI Concept Scout** is designed to reduce cognitive load and mitigate impostor syndrome among introductory Computer Science students. It provides **instant, course-specific conceptual explanations** by bridging the gap between student questions and official course materials.

### Key Features (MVP)
- **Contextual "Explain" Button:** Injects a custom action button into the Piazza DOM next to existing post controls.
- **High-Yield Topic Detection:** Automatically flags concepts that appear frequently in the syllabus or lecture series.
- **Prerequisite Bridge:** Detects complex queries and provides 1–2 sentence "concept refreshers" (e.g., explaining Memory Addresses before discussing Pointers).
- **Multi-Model Failover:** Implements a resilient backend that switches between **Groq (Llama 3)**, **Google Gemini**, and **Hugging Face** to ensure 100% uptime within free-tier constraints.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + Manifest V3 | High-performance Chrome Extension UI |
| **Backend** | Node.js + Express.js | API Proxy & orchestration layer |
| **RAG** | Custom pipeline | Retrieval-Augmented Generation over course materials |
| **Inference** | Groq / Gemini / Hugging Face | Multi-provider LLM pipeline |
| **Vector DB** | Supabase + pgvector | Semantic search over lecture notes |
| **Infrastructure** | AWS EC2 + Nginx + Vercel | Production hosting, SSL & demo deployment |

---

## 📁 Project Structure

```text
piazza-ai-concept-scout/
├── backend/
│   ├── controllers/    # Request handling logic
│   ├── services/       # Vector search & LLM orchestration
│   ├── routes/         # Express API endpoints
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── content/     # Piazza DOM injection logic
│   │   ├── components/  # React UI elements
│   │   └── App.jsx      # Extension overlay root
│   └── manifest.json   # Extension configuration
├── demo-site/          # Standalone recruiter demo (Vercel)
├── .env                # API Keys (Git-ignored)
└── README.md
```

---

## 📝 Development Roadmap

1.  **Phase 1: Visual Win & Extension Bridge**
    *   Inject "Explain Concept" button into Piazza and establish communication with the backend.
2.  **Phase 2: Express Proxy & Security**
    *   Secure API endpoints and implement environment variable management for LLM providers.
3.  **Phase 3: RAG & Vector DB Integration**
    *   Ingest course PDFs into Supabase (pgvector) to enable context-aware querying.
4.  **Phase 4: Resilient LLM Failover**
    *   Develop automated logic to switch providers based on rate limits or latency.
5.  **Phase 5: Cloud Deployment**
    *   Deploy to AWS EC2 with Nginx reverse proxy, SSL (DuckDNS), and demo on Vercel.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/OsakpolorI/piazza-ai-concept-scout
cd piazza-ai-concept-scout
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and add your API keys:
# SUPABASE_URL, SUPABASE_SERVICE_KEY, HUGGINGFACE_API_KEY
# GROQ_API_KEY, GEMINI_API_KEY
node src/server.js
```

### 3. Frontend (Extension) Setup
```bash
cd frontend
npm install
npm run build
```

### 4. Load the Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `frontend/dist` folder.

### 5. Demo Site (Optional)
```bash
cd demo-site
npm install
npm run dev
# Or deploy to Vercel
```

---

## 🔐 Security & Architecture
- **Credential Safety:** All sensitive API keys are stored server-side in `.env`; keys are never exposed to the client.
- **Minimal Permissions:** The extension requests only `storage` and host permissions for `piazza.com` and the API origin.
- **CORS:** Backend restricts allowed origins (localhost, piazza.com, Vercel demo).

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

**Author:** Osakpolor Idusuyi  
**Contact:** [LinkedIn](https://www.linkedin.com/in/osakpolor-idusuyi/) | [UofT Email](mailto:o.idusuyi@mail.utoronto.ca)
