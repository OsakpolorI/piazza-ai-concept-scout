const path = require('path');
const fs = require('fs');

// Load .env from project root (parent of backend/)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { PDFParse } = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const hfToken = process.env.HUGGINGFACE_API_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const HF_EMBEDDING_URL =
  'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
const EMBEDDING_DIMENSIONS = 384;

const DEFAULT_PDF = 'CSC263H5S-2026_Winter_Syllabus-20251210.pdf';

// For dense content (e.g. Open Data Structures): larger chunks + overlap
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 100;

// Rate limiting: avoid HF throttling on large ingests
const HF_DELAY_MS = 150;

// Timeout for each embedding request (prevents indefinite hang)
const HF_TIMEOUT_MS = 600000; // 10 minutes

// Bulk insert batch size (faster than one-by-one, avoids timeouts)
const BATCH_SIZE = 50;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function parsePdf(filePath) {
  const absPath = path.resolve(filePath);
  const fileUrl = 'file:///' + absPath.replace(/\\/g, '/');
  const parser = new PDFParse({ url: fileUrl });
  const result = await parser.getText();
  return result.text || '';
}

/**
 * Split text into chunks with optional overlap.
 * For dense content (e.g. data structures), use 800–1000 chars with 100-char overlap
 * so context isn't lost at chunk boundaries.
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  const chunks = [];
  let start = 0;

  while (start < trimmed.length) {
    let end = Math.min(start + chunkSize, trimmed.length);

    if (end < trimmed.length) {
      const slice = trimmed.slice(start, end);
      const lastSentenceEnd = slice.search(/[.!?]\s*$/);
      if (lastSentenceEnd !== -1) {
        end = start + lastSentenceEnd + 1;
      } else {
        const lastSpace = slice.lastIndexOf(' ');
        if (lastSpace > chunkSize * 0.5) end = start + lastSpace + 1;
      }
    }

    const chunk = trimmed.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

/**
 * Call Hugging Face Inference API to get embedding for text.
 * Returns 384-dim vector or null on failure.
 */
async function getEmbedding(text) {
  if (!hfToken) {
    console.error('Missing HUGGINGFACE_API_KEY in .env');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);

    const response = await fetch(HF_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF API ${response.status}: ${errText}`);
    }

    const result = await response.json();

    // API returns [[...floats]] for single input; extract inner array
    const embedding = Array.isArray(result[0]) ? result[0] : result;
    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Unexpected embedding shape: ${embedding?.length} dims`);
    }

    return embedding;
  } catch (err) {
    console.error('Embedding API error:', err.message);
    return null;
  }
}

async function bulkInsertDocuments(rows) {
  if (!supabase || rows.length === 0) return;
  const { error } = await supabase.from('documents').insert(rows);
  if (error) throw error;
}

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  if (!hfToken) {
    console.error('Missing HUGGINGFACE_API_KEY in .env');
    process.exit(1);
  }

  const pdfName = process.argv[2] || DEFAULT_PDF;
  const pdfPath = path.isAbsolute(pdfName)
    ? pdfName
    : path.join(__dirname, '..', 'data', pdfName);

  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    console.error('Usage: node scripts/ingest.js [filename.pdf]');
    process.exit(1);
  }

  console.log('Ingesting:', pdfName);
  const text = await parsePdf(pdfPath);
  const totalChars = text.length;

  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  const chunkCount = chunks.length;

  console.log('Total characters:', totalChars);
  console.log('Number of chunks:', chunkCount, `(size=${CHUNK_SIZE}, overlap=${CHUNK_OVERLAP})`);

  const filename = path.basename(pdfName);
  const batch = [];
  let inserted = 0;

  console.log('Fetching embeddings from Hugging Face...');
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (i > 0) await sleep(HF_DELAY_MS);
    const embedding = await getEmbedding(chunk);

    if (!embedding) {
      console.error(`Skipping chunk ${i + 1}/${chunkCount} (embedding failed)`);
      continue;
    }

    batch.push({
      content: chunk,
      metadata: { filename, chunk_index: i },
      embedding,
    });

    if (batch.length >= BATCH_SIZE) {
      try {
        await bulkInsertDocuments(batch);
        inserted += batch.length;
        console.log(`Inserted ${inserted}/${chunkCount}`);
      } catch (err) {
        console.error(`Bulk insert failed at chunk ${i + 1}:`, err.message);
      }
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    try {
      await bulkInsertDocuments(batch);
      inserted += batch.length;
    } catch (err) {
      console.error('Final bulk insert failed:', err.message);
    }
  }

  console.log('Ingestion complete. Inserted:', inserted, '/', chunkCount);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
