const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const hfToken = process.env.HUGGINGFACE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VectorService: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const HF_EMBEDDING_URL =
  'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
const EMBEDDING_DIMENSIONS = 384;

const DEFAULT_MATCH_THRESHOLD = 0.5;
const DEFAULT_MATCH_COUNT = 5;

/**
 * Call Hugging Face API to embed query text.
 * Returns 384-dim vector or null on failure.
 */
async function embedQuery(queryText) {
  if (!hfToken) {
    console.error('[VectorService] Missing HUGGINGFACE_API_KEY');
    return null;
  }

  try {
    const response = await fetch(HF_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: queryText }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF API ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const embedding = Array.isArray(result[0]) ? result[0] : result;

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Unexpected embedding shape: ${embedding?.length} dims`);
    }

    return embedding;
  } catch (err) {
    console.error('[VectorService] Embedding error:', err.message);
    return null;
  }
}

/**
 * Search for documents similar to the query text.
 * Uses Supabase match_documents RPC.
 * Returns top matches (content, metadata, similarity) or [] on failure.
 */
async function searchSimilarDocuments(queryText) {
  console.log('[VectorService] Query received:', queryText?.slice(0, 100) + (queryText?.length > 100 ? '...' : ''));

  const queryEmbedding = await embedQuery(queryText);
  if (!queryEmbedding) {
    console.log('[VectorService] Embedding failed — no matches');
    return [];
  }
  console.log('[VectorService] Embedding OK, length:', queryEmbedding.length);

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: DEFAULT_MATCH_THRESHOLD,
    match_count: DEFAULT_MATCH_COUNT,
  });

  if (error) {
    console.error('[VectorService] Supabase RPC error:', error.message, error.details || '');
    return [];
  }

  console.log('[VectorService] Matches found:', data?.length ?? 0);
  return data ?? [];
}

module.exports = {
  searchSimilarDocuments,
  embedQuery,
};
