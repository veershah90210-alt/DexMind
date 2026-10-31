# ⚡ DexMind — An Intelligent Pokémon Discovery & Battle Intelligence Platform

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

* **Production Web App**: [https://dex-mind-pied.vercel.app/](https://dex-mind-pied.vercel.app/)
* **Project Repository**: [https://github.com/veershah90210-alt/DexMind/](https://github.com/veershah90210-alt/DexMind/)

---

## 📖 Executive Summary

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
