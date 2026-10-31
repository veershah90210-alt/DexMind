import React, { useState, useEffect } from 'react';
import { Database, Cpu, Layers, Sparkles, ArrowRight, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { startIngestion, fetchIngestStatus } from '../services/api';

export default function Home({ healthInfo, refreshHealth, setActiveTab }) {
  const [ingestStatus, setIngestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isConnected = healthInfo?.mongodb?.connected;
  const pokemonCount = healthInfo?.mongodb?.pokemon_count || 0;
  const chunksCount = healthInfo?.mongodb?.dex_chunks_count || 0;
  const sourceDocsCount = healthInfo?.mongodb?.source_docs_count || 0;

  // Poll status when ingestion is running
  useEffect(() => {
    let interval = null;
    const checkStatus = async () => {
      try {
        const st = await fetchIngestStatus();
        setIngestStatus(st);
        if (st.is_ingesting) {
          interval = setTimeout(checkStatus, 1500);
        } else {
          refreshHealth();
        }
      } catch (err) {
        console.error('Failed to poll status', err);
      }
    };

    checkStatus();
    return () => clearTimeout(interval);
  }, []);

  const handleImport = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await startIngestion();
      // Start polling
      const poll = setInterval(async () => {
        try {
          const st = await fetchIngestStatus();
          setIngestStatus(st);
          if (!st.is_ingesting) {
            clearInterval(poll);
            setLoading(false);
            refreshHealth();
          }
        } catch (e) {
          clearInterval(poll);
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const isIngesting = ingestStatus?.is_ingesting || loading;
  const progressPct = ingestStatus?.total > 0
    ? Math.round((ingestStatus.progress / ingestStatus.total) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-zinc-900 to-red-950/40 border border-zinc-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            RAG-Powered Pokémon Research Assistant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Explore Kanto with <span className="text-red-500">Retrieval-Augmented</span> Intelligence.
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            DexMind grounds every Pokémon question, stat comparison, ability analysis, and evolution chain in verified PokéAPI source documents using MongoDB Atlas Vector Search and Gemini.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('ask')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Ask the Dex
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('pokedex')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-all cursor-pointer"
            >
              Pokédex Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Metrics / Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MongoDB Status */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Database</span>
            <Database className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-100">
              {isConnected ? 'MongoDB Atlas' : 'Offline'}
            </div>
            <div className="text-xs text-zinc-500 mt-1 truncate">
              {healthInfo?.config?.database || 'dexmind'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Status</span>
            <span className={`font-mono font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isConnected ? 'Connected' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Indexed Pokémon */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Indexed Pokémon</span>
            <Layers className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {pokemonCount}
              <span className="text-sm font-normal text-zinc-500 ml-1">/ 151</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">Generation 1 Kanto</div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Source Docs</span>
            <span className="font-mono text-zinc-300 font-bold">{sourceDocsCount}</span>
          </div>
        </div>

        {/* Search Chunks */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">RAG Chunks</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-400">
              {chunksCount}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Granular Embeddings</div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Dimension</span>
            <span className="font-mono text-zinc-300 font-bold">384-d Cosine</span>
          </div>
        </div>

        {/* Model Pipeline */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">LLM & Embeddings</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-200 truncate">
              {healthInfo?.config?.llm_model || 'gemini-2.5-flash'}
            </div>
            <div className="text-xs text-zinc-500 mt-1 truncate">
              all-MiniLM-L6-v2
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Index</span>
            <span className="font-mono text-zinc-300 truncate font-semibold">
              {healthInfo?.config?.vector_index || 'dex_vector_index'}
            </span>
          </div>
        </div>
      </div>

      {/* Ingestion Control Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>PokéAPI Ingestion Pipeline</span>
              {isIngesting && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Ingesting...
                </span>
              )}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Import the first 151 Pokémon from PokéAPI into MongoDB Atlas. Normalizes stats, abilities, evolution chains, creates granular text chunks, and generates local MiniLM embeddings.
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={isIngesting || !isConnected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              isIngesting
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : !isConnected
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 cursor-pointer'
            }`}
          >
            {isIngesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Ingesting Pokédex...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Import Kanto Pokédex (151)
              </>
            )}
          </button>
        </div>

        {/* Connection warning if not connected */}
        {!isConnected && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <div className="font-semibold text-amber-200">MongoDB Atlas Connection Needed</div>
              <div>
                Configure your <code className="bg-zinc-900 px-1 py-0.5 rounded">MONGODB_URI</code> in <code className="bg-zinc-900 px-1 py-0.5 rounded">backend/.env</code> to enable data ingestion and Vector Search.
              </div>
            </div>
          </div>
        )}

        {/* Ingestion Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Progress Bar */}
        {isIngesting && (
          <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">
                Fetching: <strong className="text-white capitalize">{ingestStatus?.current_pokemon || 'Initializing...'}</strong>
              </span>
              <span className="text-red-400 font-bold">
                {ingestStatus?.progress || 0} / {ingestStatus?.total || 151} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-linear-to-r from-red-600 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Success completion badge */}
        {!isIngesting && pokemonCount >= 151 && (
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All 151 Kanto Pokémon and {chunksCount} RAG chunks are fully indexed in MongoDB Atlas.</span>
          </div>
        )}
      </div>

      {/* Atlas Search & Vector Index Guide */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 text-xs text-zinc-400 space-y-3">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <span>MongoDB Atlas Index Setup Guide</span>
        </h4>
        <p>
          DexMind requires two search indexes configured in MongoDB Atlas on collection <code className="text-red-400 font-mono">dex_chunks</code>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono">
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-200 font-bold mb-1">1. Vector Search Index (dex_vector_index)</div>
            <div className="text-[11px] text-zinc-400">Field: <span className="text-red-400">embedding</span></div>
            <div className="text-[11px] text-zinc-400">Dimensions: <span className="text-cyan-400">384</span> | Cosine similarity</div>
          </div>
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-200 font-bold mb-1">2. Atlas Search Index (dex_text_index)</div>
            <div className="text-[11px] text-zinc-400">Type: Full-text Search</div>
            <div className="text-[11px] text-zinc-400">Indexed Fields: <span className="text-red-400">content, pokemon_name</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
