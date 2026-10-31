# DexMind — Functional RAG-Powered Pokédex MVP

DexMind is an AI-powered Pokémon research assistant built on Retrieval-Augmented Generation (RAG). It combines **MongoDB Atlas Vector Search**, **Atlas Keyword Search**, **sentence-transformers**, and **Gemini API** to provide grounded, verifiable answers to natural language questions about Pokémon.

---

## 🌟 Key Features

1. **Grounded RAG Q&A**: Answers are constructed **strictly from retrieved PokéAPI documents**. Every claim features verifiable citations `[S1]`, `[S2]`.
2. **Clickable Evidence Inspector**: Clicking any citation displays the exact retrieved text chunk, source URL, version group, and content type.
3. **Evidence Sufficiency & Unanswerable Question Abstention**: If a question falls outside indexed material (e.g. anime voice actors, trading card prices), DexMind explicitly abstains instead of hallucinating.
4. **Multi-Entity Independent Retrieval**: When comparing Pokémon (e.g., *Charizard vs Blastoise*), DexMind retrieves independent evidence for each entity to ensure balanced context.
5. **Pokédex Explorer**: Explore Generation 1 Pokémon with official sprites, base stats, types, abilities, and evolution chains.
6. **Head-to-Head Comparison**: Compare any two Pokémon side-by-side with stat difference bars and grounded comparative analysis.
7. **Team Advisor**: Recommends a balanced Generation 1 team using deterministic type coverage calculations paired with RAG synergy explanations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Python 3.15, FastAPI, PyMongo, Uvicorn, httpx
- **Database**: MongoDB Atlas (Source Documents, Normalized Pokémon, RAG Chunks)
- **Vector Search**: MongoDB Atlas Vector Search (Cosine similarity)
- **Keyword Search**: MongoDB Atlas Search (Full-text)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions, local inference)
- **LLM**: Gemini API via `google-genai` SDK (`gemini-2.5-flash`)
- **Data Source**: PokéAPI (v2)

---

## 📁 Project Structure

```
DexMind/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration & variables
│   │   ├── database.py            # MongoDB Atlas connection & client pool
│   │   ├── main.py                # FastAPI application entrypoint
│   │   ├── rag/
│   │   │   ├── embeddings.py      # Local 384-d sentence-transformers embeddings
│   │   │   ├── query_router.py    # Intent parsing & multi-entity splitting
│   │   │   ├── retrieval.py       # MongoDB Vector + Atlas Search & error handling
│   │   │   ├── reranking.py       # Reciprocal Rank Fusion (RRF) deduplication
│   │   │   └── generator.py       # Strict prompt & citation validation with Gemini
│   │   ├── routes/
│   │   │   ├── ask.py             # POST /api/ask (RAG Q&A)
│   │   │   ├── compare.py         # POST /api/compare (Head-to-Head comparison)
│   │   │   ├── ingest.py          # POST /api/ingest/kanto, GET /api/ingest/status
│   │   │   ├── pokemon.py         # GET /api/pokemon, GET /api/pokemon/{id}
│   │   │   └── team.py            # GET /api/team/advisor (Team composition)
│   │   └── services/
│   │       ├── pokeapi.py         # PokéAPI client with keep-alive & in-memory caching
│   │       ├── ingestion.py       # Pipeline for 151 Pokémon & chunk generation
│   │       └── team_advisor.py    # Deterministic coverage & type calculations
│   ├── scripts/
│   │   └── seed_pokedex.py        # CLI script to seed data into Atlas
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Backend environment template
│   └── .env                       # Backend environment secrets
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar & Atlas live connection pill
│   │   │   ├── PokemonCard.jsx    # Pokédex card with sprites & type badges
│   │   │   ├── CitationPanel.jsx  # Exact retrieved passage inspector modal
│   │   │   └── ComparisonCard.jsx # Side-by-side stats & grounded RAG diff
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Dashboard with live stats & ingestion trigger
│   │   │   ├── AskDex.jsx         # RAG Chat interface with suggested questions
│   │   │   ├── Pokedex.jsx        # Grid explorer with filters & detail modal
│   │   │   └── ComparePage.jsx    # Dual Pokémon selector & comparison
│   │   ├── services/
│   │   │   └── api.js             # Frontend API client
│   │   ├── App.jsx                # Application shell
│   │   └── index.css              # Dark Pokédex Tailwind styling
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)

Create or update `backend/.env`:

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

### Frontend Setup (`frontend/.env`)

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🔍 MongoDB Atlas Search Index Configurations

DexMind requires two indexes configured in MongoDB Atlas on the `dexmind.dex_chunks` collection.

### 1. Vector Search Index (`dex_vector_index`)

In MongoDB Atlas:
1. Navigate to your cluster → **Atlas Search** → **Create Search Index**.
2. Select **Atlas Vector Search** (JSON Editor).
3. Select Database: `dexmind`, Collection: `dex_chunks`.
4. Index Name: `dex_vector_index`
5. Paste the following JSON definition:

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

### 2. Atlas Full-Text Search Index (`dex_text_index`)

In MongoDB Atlas:
1. Under **Atlas Search** → **Create Search Index**.
2. Select **Atlas Search** (JSON Editor).
3. Select Database: `dexmind`, Collection: `dex_chunks`.
4. Index Name: `dex_text_index`
5. Paste the following JSON definition:

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

### 1. Start the Backend API

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API is available at:
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend Development Server

In another terminal:
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📥 Ingestion & Verification Workflow

1. Open **DexMind Dashboard** (`http://localhost:5173`).
2. Verify that **Atlas Connected** shows green.
3. Click **"Import Kanto Pokédex (151)"** (or run `python backend/scripts/seed_pokedex.py` in the terminal).
4. Watch the live progress bar as it fetches all 151 Pokémon from PokéAPI, generates local 384-d embeddings, and indexes them in MongoDB Atlas.
5. Once indexed:
   - Go to **Ask the Dex** and click **"Compare Charizard and Blastoise"**.
   - Check the citation badges `[S1]`, `[S2]`. Click any citation badge to view the exact retrieved passage.
   - Test an unanswerable question: *"Who voiced Pikachu in the anime?"* and verify that DexMind explicitly abstains.
   - Go to **Pokédex Explorer** to inspect cards, filter by type, and open detail views.
   - Go to **Compare** to run head-to-head stat comparisons.

---

## 🛡️ RAG Architecture & Verification Rules

- **Modular LLM Design**: Clean `BaseLLMProvider` interface allows swapping Gemini for another model provider seamlessly.
- **Strict Grounding Prompt**: Gemini is instructed to answer solely using supplied evidence passages `[S1]`, `[S2]`.
- **Backend Citation Validation**: The backend parses all citations in the LLM output, verifies they exist in the retrieved candidate list, and strips hallucinations.
- **Fail-Fast Index Notification**: If `dex_vector_index` or `dex_text_index` is not configured, DexMind raises an explicit `AtlasIndexError` guiding the user on how to configure the index in MongoDB Atlas.
