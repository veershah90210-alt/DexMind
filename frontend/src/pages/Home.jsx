import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  AlertCircle,
  RefreshCw,
  GitCompare,
  Flame,
  Zap,
} from 'lucide-react';
import { startIngestion, fetchIngestStatus } from '../services/api';

const FEATURED_POKEMON = [
  {
    id: 6,
    name: 'Charizard',
    type: 'Fire / Flying',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    glow: 'rgba(249, 115, 22, 0.3)',
  },
  {
    id: 25,
    name: 'Pikachu',
    type: 'Electric',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    glow: 'rgba(234, 179, 8, 0.3)',
  },
  {
    id: 94,
    name: 'Gengar',
    type: 'Ghost / Poison',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  {
    id: 9,
    name: 'Blastoise',
    type: 'Water',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    glow: 'rgba(14, 165, 233, 0.3)',
  },
  {
    id: 150,
    name: 'Mewtwo',
    type: 'Psychic',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  {
    id: 149,
    name: 'Dragonite',
    type: 'Dragon / Flying',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
];

const SAMPLE_PROMPTS = [
  {
    icon: Flame,
    title: 'Hot Fire Blasters',
    query: 'Which Pokémon blast super hot fire?',
  },
  {
    icon: Zap,
    title: 'Pikachu Matchups',
    query: 'Which type of pokemon can pikachu beat easily?',
  },
  {
    icon: GitCompare,
    title: 'Iconic Duel',
    query: 'Compare Charizard and Blastoise.',
  },
  {
    icon: Sparkles,
    title: 'Eeveelutions',
    query: "Explain Eevee's evolution chain.",
  },
];

export default function Home({
  healthInfo,
  refreshHealth,
  setActiveTab,
  onSelectPrompt,
}) {
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
      const poll = setInterval(async () => {
        try {
          const st = await fetchIngestStatus();
          setIngestStatus(st);
          if (!st.is_ingesting) {
            clearInterval(poll);
            setLoading(false);
            refreshHealth();
          }
        } catch {
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
  const progressPct =
    ingestStatus?.total > 0
      ? Math.round((ingestStatus.progress / ingestStatus.total) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Hero Showcase Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10131d] via-[#10131d] to-[#250d14] border border-white/[0.08] p-8 sm:p-12 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            MongoDB Atlas Vector Search + Gemini
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Explore Kanto with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              Retrieval-Augmented
            </span>{' '}
            Intelligence.
          </h1>

          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
            DexMind grounds every Pokémon question, head-to-head matchup, ability breakdown, and evolution chain in canonical PokéAPI records with verifiable citations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <button
              onClick={() => setActiveTab('ask')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <span>Ask the Dex</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('pokedex')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-100 font-bold text-sm border border-white/[0.1] transition-all cursor-pointer"
            >
              <span>Pokédex Explorer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Research Prompts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Quick AI Research Inquiries
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            Click to launch grounded query
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (onSelectPrompt) onSelectPrompt(item.query);
                  else setActiveTab('ask');
                }}
                className="group bg-[#10131d] hover:bg-[#151a27] border border-white/[0.08] hover:border-red-500/40 p-4 rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    "{item.query}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300">
                  <span>Ask DexMind</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Pokémon Showcase Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-400" />
            Iconic Kanto Pokémon
          </h3>
          <button
            onClick={() => setActiveTab('pokedex')}
            className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All 151</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURED_POKEMON.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#10131d] hover:bg-[#151a27] border border-white/[0.08] hover:border-red-500/40 p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all duration-150 relative overflow-hidden shadow-md"
            >
              <div
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity"
                style={{ backgroundColor: p.glow }}
              />
              <span className="text-[10px] font-mono font-bold text-zinc-500 mb-1">
                #{String(p.id).padStart(3, '0')}
              </span>
              <img
                src={p.sprite}
                alt={p.name}
                onError={(e) => {
                  e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                }}
                className="w-20 h-20 object-contain drop-shadow my-1 group-hover:scale-110 transition-transform duration-200"
              />
              <h4 className="text-sm font-bold text-zinc-100 group-hover:text-red-400 transition-colors capitalize">
                {p.name}
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {p.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Telemetry & RAG Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MongoDB Status */}
        <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Database</span>
            <Database
              className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}
            />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {isConnected ? 'MongoDB Atlas' : 'Offline'}
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 truncate">
              Cluster DB: {healthInfo?.config?.database || 'dexmind'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Status</span>
            <span
              className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {isConnected ? 'Online & Synced' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Indexed Pokémon */}
        <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Indexed Pokémon</span>
            <Layers className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              {pokemonCount}
              <span className="text-sm font-normal text-zinc-500 ml-1">/ 151</span>
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1">Generation 1 Kanto</div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Source Docs</span>
            <span className="text-zinc-200 font-bold">{sourceDocsCount}</span>
          </div>
        </div>

        {/* Search Chunks */}
        <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">RAG Chunks</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-400">
              {chunksCount}
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1">Granular Embeddings</div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Dimension</span>
            <span className="text-zinc-200 font-bold">384-d Cosine</span>
          </div>
        </div>

        {/* Model Pipeline */}
        <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">LLM & Index</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 truncate">
              {healthInfo?.config?.llm_model || 'gemini-3.5-flash-lite'}
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 truncate">
              all-MiniLM-L6-v2
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Vector Index</span>
            <span className="text-zinc-200 truncate font-semibold">
              {healthInfo?.config?.vector_index || 'dex_vector_index'}
            </span>
          </div>
        </div>
      </div>

      {/* Ingestion Control Section */}
      <div className="bg-[#10131d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
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
                {pokemonCount >= 151 ? 'Reseed Kanto Pokédex' : 'Import Kanto Pokédex (151)'}
              </>
            )}
          </button>
        </div>

        {/* Warning if disconnected */}
        {!isConnected && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <div className="font-semibold text-amber-200">MongoDB Atlas Connection Needed</div>
              <div>
                Configure your <code className="bg-[#090a10] px-1 py-0.5 rounded">MONGODB_URI</code> in{' '}
                <code className="bg-[#090a10] px-1 py-0.5 rounded">backend/.env</code> to enable data ingestion and Vector Search.
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
          <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-3">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {ingestStatus?.status_message || 'Processing PokéAPI data...'}
              </span>
              <span className="font-bold text-white">{progressPct}%</span>
            </div>

            <div className="w-full bg-white/[0.04] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-300 shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
