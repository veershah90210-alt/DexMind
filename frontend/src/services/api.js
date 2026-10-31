import { cleanErrorMessage } from '../utils/battleAnalysis';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('DexMind telemetry service is currently unreachable.');
  return res.json();
}

export async function startIngestion() {
  const res = await fetch(`${API_BASE}/api/ingest/kanto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    const raw = data.detail?.message || data.detail || 'Failed to start ingestion';
    throw new Error(cleanErrorMessage(raw));
  }
  return data;
}

export async function fetchIngestStatus() {
  const res = await fetch(`${API_BASE}/api/ingest/status`);
  if (!res.ok) throw new Error('Unable to retrieve database ingestion status.');
  return res.json();
}

export async function fetchPokemonList(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.type && params.type !== 'All') query.append('type', params.type);
  if (params.generation && params.generation !== 'All') query.append('generation', params.generation);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const url = `${API_BASE}/api/pokemon${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Unable to retrieve Pokémon records. Please check your connection.');
  return res.json();
}

export async function fetchPokemonDetail(id) {
  const res = await fetch(`${API_BASE}/api/pokemon/${id}`);
  if (!res.ok) throw new Error(`Unable to load records for Pokémon #${id}.`);
  return res.json();
}

export async function askQuestion(question, filters = null, history = null) {
  const res = await fetch(`${API_BASE}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, filters, history }),
  });
  const data = await res.json();
  if (!res.ok) {
    let errorMsg = 'Failed to answer question';
    if (typeof data.detail === 'string') {
      errorMsg = data.detail;
    } else if (data.detail?.message) {
      errorMsg = data.detail.message;
    } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      errorMsg = data.detail[0].msg;
    }
    const errorType = data.detail?.error_type || 'Error';
    const err = new Error(cleanErrorMessage(errorMsg));
    err.type = errorType;
    throw err;
  }
  return data;
}

export async function comparePokemon(pokemon1, pokemon2) {
  const res = await fetch(`${API_BASE}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pokemon1, pokemon2 }),
  });
  const data = await res.json();
  if (!res.ok) {
    let errorMsg = 'Failed to compare Pokémon';
    if (typeof data.detail === 'string') {
      errorMsg = data.detail;
    } else if (data.detail?.message) {
      errorMsg = data.detail.message;
    } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      errorMsg = data.detail[0].msg;
    }
    throw new Error(cleanErrorMessage(errorMsg));
  }
  return data;
}
