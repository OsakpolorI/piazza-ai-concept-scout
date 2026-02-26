require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

async function parsePdf(filePath) {
  // TODO: Parse PDF and return raw text
  // Use pdf-parse
  throw new Error('Not implemented');
}

function chunkText(text, options = {}) {
  // TODO: Split text into overlapping chunks (e.g., 512 tokens, 50 token overlap)
  // Return array of { content, metadata }
  throw new Error('Not implemented');
}

async function getEmbedding(text) {
  // TODO: Call Hugging Face Inference API for sentence-transformers/all-MiniLM-L6-v2
  // Return embedding vector (384 dimensions)
  throw new Error('Not implemented');
}

async function insertDocument(content, metadata, embedding) {
  // TODO: Insert into Supabase documents table (id, content, metadata, embedding)
  throw new Error('Not implemented');
}

async function main() {
  // TODO: Orchestrate: parse PDF → chunk → embed → insert
  console.log('RAG ingestion pipeline — scaffolding ready');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
