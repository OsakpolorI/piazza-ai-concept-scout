# Piazza AI Concept Scout

**A context-aware research assistant for CS1 students, integrated directly into the Piazza interface.**

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
| **Orchestration** | LangChain | Retrieval-Augmented Generation (RAG) |
| **Inference** | Groq / Gemini / Hugging Face | Multi-provider LLM pipeline |
| **Vector DB** | Pinecone / ChromaDB | Semantic search over lecture notes |
| **Infrastructure** | AWS EC2 + Nginx | Production hosting & SSL management |

---

## 📁 Project Structure

```text
piazza-ai-concept-scout/
├── backend/
│   ├── controllers/    # Request handling logic
│   ├── services/       # Business logic & LLM orchestration
│   ├── routes/         # Express API endpoints
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── content.js   # Piazza DOM injection logic
│   │   ├── components/ # React UI elements
│   │   └── App.jsx      # Extension popup/overlay root
│   └── manifest.json    # Extension configuration
├── .env                # API Keys (Git-ignored)
├── package.json
└── README.md
```

---

## 📝 Development Roadmap

1.  **Phase 1: Visual Win & Extension Bridge**
    *   Inject "Explain Concept" button into Piazza and establish communication with local Node.js backend.
2.  **Phase 2: Express Proxy & Security**
    *   Secure API endpoints and implement environment variable management for LLM providers.
3.  **Phase 3: RAG & Vector DB Integration**
    *   Ingest course PDFs into a Vector Database to enable context-aware querying.
4.  **Phase 4: Resilient LLM Failover**
    *   Develop automated logic to switch providers based on rate limits or latency.
5.  **Phase 5: Cloud Deployment**
    *   Deploy to AWS EC2 with Nginx reverse proxy and SSL encryption.

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
# Create a .env file and add your API keys:
# GROQ_API_KEY=your_key
# GEMINI_API_KEY=your_key
node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```

### 4. Load the Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `frontend/dist` (or `frontend` during development) folder.

---

## 🔐 Security & Architecture
- **Credential Safety:** All sensitive API keys are stored server-side in an encrypted `.env` file; keys are never exposed to the client-side extension code.
- **Minimal Permissions:** The extension follows the principle of least privilege, requesting only `storage` and host permissions for `piazza.com`.
- **Modular Design:** Built using a **Controller/Service pattern** to ensure the code remains extensible for future adaptive learning features.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

**Author:** Osakpolor Idusuyi  
**Contact:** [LinkedIn](https://www.linkedin.com/in/osakpolor-idusuyi/) | [UofT Email](mailto:o.idusuyi@mail.utoronto.ca)
