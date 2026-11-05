#  DexMind — An Intelligent Pokémon Discovery & Battle Intelligence Platform

<div align="center">

  [![Live Demo](https://img.shields.io/badge/Demo-Live%20Deployment-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://dex-mind-pied.vercel.app/)
  [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/veershah90210-alt/DexMind/)
  [![Hackathon](https://img.shields.io/badge/Nexus%20Uncharted-Hackathon%202026-EE1515?style=for-the-badge&logo=pokemon&logoColor=white)](#-built-by-team-404notfound)
  [![Database](https://img.shields.io/badge/MongoDB-Atlas%20Vector%20Search-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/products/platform/atlas-vector-search)
  [![AI](https://img.shields.io/badge/Google-Gemini%20API-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

  <p align="center">
    <strong>Built by Team 404NotFound for Nexus Uncharted Hackathon 2026</strong>
  </p>
  <p align="center">
    <em>"Don't just search your Pokédex. Talk to it."</em>
  </p>
</div>


---

## 🌐 Live Deployment & Preview


* **🧠 Strictly Grounded RAG Q&A**: Answers are generated exclusively from verified PokéAPI documentation. Every tactical assertion, stat comparison, and ability detail is mapped to explicit citation markers (e.g., `[S1]`, `[S2]`).
* **🔍 Interactive Evidence Inspector**: Click any citation badge to open a detailed modal showing the exact retrieved chunk, content category (`overview_stats`, `type_matchup`, `ability`, `evolution`, `pokedex_entry`), version group, and PokéAPI source URL.
* **🛡️ Hallucination & Abstention Guardrails**: If asked about unindexed out-of-scope topics (e.g., anime voice actors, TCG card values) or non-canonical queries, DexMind explicitly abstains instead of fabricating answers.
* **⚔️ Multi-Entity Independent Retrieval**: Complex head-to-head queries (e.g., *"Charizard vs. Dragonite"*) dynamically split into dedicated entity sub-queries, preventing context starvation and ensuring unbiased evidence.
* **📊 Pokédex Explorer & Stat Comparator**: Browse full Pokédex entries with official Sugimori artwork, base stat LED distributions, and direct head-to-head comparisons featuring automated win/loss differentials.
* **🏆 Deterministic Team Advisor**: Combines algorithmic type-coverage calculation (evaluating multi-type resistances, 2x/4x weaknesses, and offensive super-effective spread) with RAG-generated tactical synergy dossiers.
=======
* **Production Web App**: [https://dex-mind-pied.vercel.app/](https://dex-mind-pied.vercel.app/)
* **Project Repository**: [https://github.com/veershah90210-alt/DexMind/](https://github.com/veershah90210-alt/DexMind/)


---

## 📖 Executive Summary


| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 | High-contrast, zero-border-radius tactical Pokédex UI |
| **Animation & UI** | Motion, Lucide Icons, Remark GFM | Fluid micro-interactions and markdown citation parsing |
| **Backend API** | Python 3.15, FastAPI, Uvicorn | Asynchronous REST endpoints, CORS middleware, data routers |
| **Database** | MongoDB Atlas (PyMongo) | Primary storage for raw records, normalized Pokédex, and chunks |
| **Vector Search** | MongoDB Atlas Vector Search | 384-dimensional cosine similarity indexing on embedding vectors |
| **Full-Text Search** | MongoDB Atlas Search | Compound keyword retrieval on Pokémon names and content text |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | Fast, localized 384-dimensional dense vector embeddings |
| **LLM Provider** | Google Gemini (`gemini-2.5-flash` / `google-genai`) | Low-latency, instruction-tuned tactical generation |
| **Data Provider** | PokéAPI (v2) via HTTPX | Upstream REST API client with persistent keep-alive and caching |

---

## 📐 Hybrid RAG Pipeline Architecture

```text
[ User Query ]
      │
      ▼
[ Query Router & Entity Extractor ] ──► (Detects Entities, Intent, Typo-Tolerant Names)
      │
      ├──────────────────────────────┬──────────────────────────────┐
      ▼                              ▼                              ▼
[ Dense Vector Search ]    [ Atlas Keyword Search ]      [ Weakness Cross-Filter ]
(MiniLM-L6-v2 Cosine 384d)   (Compound Full-Text)       (Candidate Counter Selection)
      │                              │                              │
      └──────────────────────────────┴──────────────────────────────┘
                                     │
                                     ▼
                     [ Reciprocal Rank Fusion (RRF) ]
                       (Score = Σ 1 / (60 + Rank))
                                     │
                                     ▼
                      [ Chunk Deduplication & Tagging ]
                            ([S1], [S2], [S3]...)
                                     │
                                     ▼
                  [ Gemini Grounded Prompt Generator ]
                   (Strict System Instruction Filter)
                                     │
                                     ▼
                    [ Citation Verification Layer ]
                 (Strips Hallucinated Source References)
                                     │
                                     ▼
                     [ Verified Structured Response ]

```

---

## 📁 Repository Structure

```text
DexMind/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment variables and model definitions
│   │   ├── database.py            # MongoDB Atlas connection pool and health checks
│   │   ├── main.py                # FastAPI initialization, CORS, and route mounting
│   │   ├── rag/
│   │   │   ├── all_pokemon_names.json # Canonical Pokémon name registry for matching
│   │   │   ├── embeddings.py      # Local SentenceTransformer embedding generator
│   │   │   ├── generator.py       # Gemini API client, system prompt, citation validator
│   │   │   ├── query_router.py    # Typo tolerance, intent classification, sub-queries
│   │   │   ├── reranking.py       # Reciprocal Rank Fusion (RRF) algorithm
│   │   │   └── retrieval.py       # Hybrid Atlas Vector + Full-Text Search orchestrator
│   │   ├── routes/
│   │   │   ├── ask.py             # POST /api/ask (Grounded Q&A endpoint)
│   │   │   ├── compare.py         # POST /api/compare (Head-to-head comparison)
│   │   │   ├── ingest.py          # POST /api/ingest/* (Data sync triggers)
│   │   │   ├── pokemon.py         # GET /api/pokemon (Directory, details, filters)
│   │   │   └── team.py            # GET /api/team/advisor (Synergy calculation)
│   │   └── services/
│   │       ├── ingestion.py       # Chunk generation, damage relation calculator
│   │       ├── pokeapi.py         # Async HTTPX client for PokéAPI v2
│   │       └── team_advisor.py    # Deterministic team coverage analyzer
│   ├── scripts/
│   │   └── seed_pokedex.py        # CLI batch ingestion and embedding utility
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitationPanel.jsx  # Interactive source chunk inspector
│   │   │   ├── ComparisonCard.jsx # Side-by-side battle statistics diff
│   │   │   ├── Navbar.jsx         # Navigation bar with live Atlas connection pill
│   │   │   └── PokemonCard.jsx    # Pokédex entity cards with type badges
│   │   ├── pages/
│   │   │   ├── AskDex.jsx         # Conversational RAG workspace
│   │   │   ├── ComparePage.jsx    # Dual-Pokémon battle analytics
│   │   │   ├── Home.jsx           # Dashboard overview and ingestion triggers
│   │   │   └── Pokedex.jsx        # Searchable, filterable Pokémon directory
│   │   ├── services/
│   │   │   └── api.js             # Frontend API request layer
│   │   ├── App.jsx                # Layout frame and active tab state
│   │   └── index.css              # Custom Tailwind CSS styling and reset rules
│   ├── package.json               # Frontend dependencies and Vite build scripts
│   └── vite.config.js             # Vite development server and API proxy setup
├── package.json                   # Root monorepo proxy scripts
└── README.md

```
=======
Traditional Pokédex tools are static reference manuals: looking up base stats, damage multipliers, abilities, and competitive interactions across multiple Pokémon requires jumping through disconnected wiki tabs. Meanwhile, general-purpose LLMs regularly hallucinate Pokémon typings, movepool legality, base stat totals, and competitive mechanics when queried in freeform text.

**DexMind** bridges this gap. It is a full-stack, production-engineered Pokémon research engine powered by a **Hybrid Retrieval-Augmented Generation (RAG)** pipeline. By synchronizing **MongoDB Atlas Vector Search**, **Atlas Keyword Full-Text Search**, local high-efficiency embeddings, and Google's **Gemini API**, DexMind delivers conversational responses strictly grounded in canonical game records. Every statement is reinforced with verifiable, clickable in-text source citations (`[S1]`, `[S2]`) directly mapped to indexed Pokémon document chunks.

---

## 🌟 Core System Features

### 1. 🧠 Grounded Hybrid RAG Assistant (`Ask the Dex`)
* **Strict Fact-Checking**: Responses are generated exclusively from verified PokéAPI documentation and canonical game texts retrieved at runtime.
* **Clickable Evidence Inspector**: Clicking any citation badge (`[S1]`, `[S2]`) launches a modal displaying the exact raw text chunk, source URL, game version group, and content classification.
* **Zero-Hallucination Abstention**: If a user asks about non-canonical mechanics, unindexed real-world queries (e.g., TCG secondary market pricing, anime voice cast), or invalid attributes, DexMind's generation boundary refuses to extrapolate and explicitly declares that required records are not indexed.

### 2. ⚔️ Multi-Entity Independent Retrieval & Head-to-Head Compare
* **Entity-Balanced Sub-Queries**: When analyzing multi-Pokémon matchups (e.g., *Charizard vs. Blastoise*), the query router automatically isolates each entity and issues dedicated vector and keyword searches to guarantee balanced context without document starvation.
* **Structured Comparison Metrics**: View side-by-side base stat comparisons, automated differential delta calculations, speed tier determinations, and tactical battle summaries.

### 3. 🛡️ Deterministic Team Synergy Advisor
* **Mathematical Coverage Engine**: Calculates offensive super-effective type coverage and identifies shared defensive vulnerabilities (types that threaten 3 or more team members).
* **Tactical Role Synthesis**: Recommends balanced tournament team cores (physical sweepers, special walls, defensive pivots, hazard leads) backed by narrative explanations from the RAG engine.

### 4. 🗂️ Unified National Pokédex Explorer
* **High-Performance Grid**: Instant filtering across elemental types, generation selectors (Gen 1 through Gen 9), and instant text search by name or National Dex number.
* **Official Visual Assets**: Integrated official Ken Sugimori transparent artwork, Dream World SVGs, high-resolution sprites, base stat distributions, abilities (including hidden abilities), and branching evolution paths.


---

## 🏗️ Technical Architecture & Pipeline

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=dexmind
GEMINI_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_INDEX_NAME=dex_vector_index
TEXT_INDEX_NAME=dex_text_index
PORT=8000

```

### Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend/` directory (optional in development due to Vite proxy):

```env
VITE_API_URL=http://127.0.0.1:8000

```

---

## 🔍 MongoDB Atlas Search Index Setup

DexMind requires two search indexes created on the `dexmind.dex_chunks` collection.

### 1. Vector Search Index (`dex_vector_index`)

1. Open your cluster in **MongoDB Atlas** → **Atlas Search** → **Create Search Index**.

2. Choose **Atlas Vector Search** → **JSON Editor**.

3. Target Database: `dexmind`, Collection: `dex_chunks`.

4. Set Index Name: `dex_vector_index`.

5. Paste the configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "pokemon_id"
    },
    {
      "type": "filter",
      "path": "pokemon_name"
    },
    {
      "type": "filter",
      "path": "generation"
    },
    {
      "type": "filter",
      "path": "content_type"
    },
    {
      "type": "filter",
      "path": "language"
    },
    {
      "type": "filter",
      "path": "version_group"
    }
  ]
}

```

### 2. Full-Text Search Index (`dex_text_index`)

1. In **Atlas Search** → **Create Search Index**.

2. Choose **Atlas Search** → **JSON Editor**.

3. Target Database: `dexmind`, Collection: `dex_chunks`.

4. Set Index Name: `dex_text_index`.

5. Paste the configuration:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "content": {
        "type": "string"
      },
      "pokemon_name": {
        "type": "string"
      },
      "content_type": {
        "type": "string"
      },
      "source_id": {
        "type": "string"
      }
    }
  }
}

```

---

## 🚀 Running DexMind Locally

### 1. Start the Backend Service

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

```

* Backend Health Check: `http://127.0.0.1:8000/api/health`

* Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend Client

In a separate terminal:

```bash
# From repository root
npm run install:frontend
npm run dev

```

* Web UI: `http://localhost:5173`

---

## 📥 Ingestion & Verification Workflow

1. Navigate to the **DexMind Dashboard** (`http://localhost:5173`) and ensure the MongoDB Atlas indicator reflects **Connected**.

2. Ingest the Generation 1 baseline:
* **Via Web UI**: Click **"Import Kanto Pokédex (151)"** on the Home tab.

* **Via CLI**: Run `python backend/scripts/seed_pokedex.py --start 1 --end 151`.

3. The ingestion worker will fetch entries from PokéAPI, calculate comprehensive type matchups, generate local dense embeddings (`384d`), and upsert raw documents, entities, and text chunks into Atlas.

4. Test the pipeline:
* Open **Ask the Dex** and submit: *"Compare Charizard and Dragonite in terms of typing, stats, and tactical matchups."*

* Inspect the returned citations (`[S1]`, `[S2]`) to verify source alignment.

* Try an invalid out-of-scope query: *"How much does a 1st edition Charizard card cost on eBay?"* and verify explicit system abstention.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | `GET` | Validates MongoDB connection and index configurations.
| `/api/ask` | `POST` | Primary RAG endpoint accepting questions, filters, and chat history.
| `/api/compare` | `POST` | Dual Pokémon stats comparison and comparative RAG analysis.
| `/api/pokemon` | `GET` | Paginated Pokémon directory with name and elemental type filters.
| `/api/pokemon/{id}` | `GET` | Retrieves complete normalized Pokémon record by ID.
| `/api/team/advisor` | `GET` | Returns mathematically balanced core team with synergy explanations.
| `/api/ingest/kanto` | `POST` | Background worker importing Generation 1 Pokémon (IDs 1–151).
| `/api/ingest/all` | `POST` | Full worker import covering Generations 1 through 9 (IDs 1–1025).
| `/api/ingest/status` | `GET` | Ingestion status, progress percentage, and indexing statistics.
---

## 👥 Team 404NotFound

Developed for **Nexus Uncharted Hackathon 2026**.

* **Repository**: [https://github.com/veershah90210-alt/DexMind/](https://github.com/veershah90210-alt/DexMind/)

*Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc.*

```
=======
[ User Query ]
                                    │
                                    ▼
                         [ Intent Query Router ]
                   (Typo Tolerance & Multi-Entity Split)
                                    │
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
   [ Sentence-Transformers ]               [ Atlas Keyword Search ]
 (384-d all-MiniLM-L6-v2)                   (Compound Must / Filter)
                │                                       │
                ▼                                       ▼
  [ MongoDB Atlas Vector Search ]            [ MongoDB Atlas Search ]
      (Cosine Similarity Index)                 (Full-Text Index)
                │                                       │
                └───────────────────┬───────────────────┘
                                    │
                                    ▼
                    [ Reciprocal Rank Fusion (RRF) ]
                   Score = Σ ( 1 / (60 + Rank_i) )
                                    │
                                    ▼
                     [ Validated Context Assembler ]
                       (Tagged Sources [S1], [S2])
                                    │
                                    ▼
                       [ Google Gemini LLM Engine ]
                    (Strict Grounding & Citation Check)
                                    │
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
    [ Sufficient Evidence ]                 [ Out of Scope / Missing ]
   Grounded Response + Sources              Explicit Abstention Notice

   ### The 4-Step Under-the-Hood Workflow
1. **Query Processing & Vectorization**: Natural language queries are tokenized and translated into dense 384-dimensional vector embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
2. **Hybrid Search Execution**: The backend concurrently queries MongoDB Atlas via `$vectorSearch` (cosine similarity on the `embedding` field) and `$search` (BM25 keyword search across `content` and `pokemon_name`).
3. **Reciprocal Rank Fusion (RRF)**: Candidate documents from both ranking engines are deduplicated and merged using RRF ($k=60$) to prioritize documents with high semantic relevance and exact keyword density.
4. **Context Injection & Citation Enforcement**: Assembled candidate chunks are injected into Gemini's system instructions. The model is constrained to cite claims using `[S#]` tags. The backend validates every
>>>>>>> 26dc549671cfbe6bd48b2d0cfe23486a5234d947
