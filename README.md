# ⚡ DexMind 

<div align="center">
  <h3>The Ultimate RAG-Powered Pokédex & Battle Intelligence System</h3>
  <p>
    Built with <strong>React 19</strong>, <strong>FastAPI</strong>, <strong>MongoDB Atlas Vector Search</strong>, and <strong>Google Gemini</strong>.
  </p>
</div>

---

DexMind is an advanced, AI-driven Pokémon research assistant. Moving beyond static databases, it utilizes **Retrieval-Augmented Generation (RAG)** to provide grounded, verifiable answers to natural language questions about Pokémon stats, battle strategies, type matchups, and lore. 

## ✨ Key Features

* **🧠 Grounded RAG Q&A**: Answers are constructed **strictly from retrieved PokéAPI documents**. Every tactical claim features verifiable citations (e.g., `[S1]`, `[S2]`).
* **🔍 Clickable Evidence Inspector**: Click any citation badge to view the exact retrieved text chunk, source URL, game version, and content type.
* **🛡️ Hallucination Guardrails**: If a question falls outside indexed material (e.g., anime voice actors, TCG prices), DexMind explicitly abstains instead of inventing information.
* **⚔️ Multi-Entity Independent Retrieval**: When comparing Pokémon (e.g., *Charizard vs. Blastoise*), the query router splits the intent to retrieve independent, balanced evidence for each entity.
* **📊 Pokédex & Head-to-Head Comparison**: Explore generation data, official sprites, and compare any two Pokémon side-by-side with stat difference bars.
* **🏆 Competitive Team Advisor**: Generates a balanced Kanto team using deterministic type-coverage calculations paired with RAG synergy explanations.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Python 3.15, FastAPI, PyMongo, Uvicorn, HTTPX |
| **Database** | MongoDB Atlas (Raw Data, Normalized Documents, RAG Chunks) |
| **AI / Search** | Atlas Vector Search, Atlas Full-Text Search, Gemini API (`gemini-2.5-flash`), `sentence-transformers` (Local Embeddings) |

## 📂 Project Architecture

```text
dexmind-root/
├── backend/
│   ├── app/
│   │   ├── rag/           # Query routing, RRF reranking, embedding, Gemini generator
│   │   ├── routes/        # FastAPI endpoints (ask, compare, ingest, pokemon, team)
│   │   └── services/      # PokéAPI client, ingestion pipeline, team advisor math
│   └── scripts/           # Database seeding utilities
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, PokemonCard, CitationPanel)
│   │   ├── pages/         # Core views (Home, AskDex, Pokedex, ComparePage)
│   │   └── services/      # API communication layer
│   └── vite.config.js     # Dev server & /api proxy configuration
└── package.json           # Root workspace scripts
