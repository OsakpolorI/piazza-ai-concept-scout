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

async function parsePdf(filePath) {
  const absPath = path.resolve(filePath);
  const fileUrl = 'file:///' + absPath.replace(/\\/g, '/');
  const parser = new PDFParse({ url: fileUrl });
  const result = await parser.getText();
  return result.text || '';
}

/**
 * Split text into chunks of ~chunkSize characters, preserving sentence boundaries.
 */
function chunkText(text, chunkSize = 500) {
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
    start = end;
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
    const response = await fetch(HF_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

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

async function insertDocument(content, metadata, embedding) {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('documents').insert({
    content,
    metadata,
    embedding,
  });

  if (error) throw error;
  return {};
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

  const chunks = chunkText(text, 500);
  const chunkCount = chunks.length;

  console.log('Total characters:', totalChars);
  console.log('Number of chunks:', chunkCount);

  const filename = path.basename(pdfName);
  let inserted = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await getEmbedding(chunk);

    if (!embedding) {
      console.error(`Skipping chunk ${i + 1}/${chunkCount} (embedding failed)`);
      continue;
    }

    try {
      await insertDocument(chunk, { filename, chunk_index: i }, embedding);
      inserted++;
      console.log(`Inserted chunk ${inserted}/${chunkCount}`);
    } catch (err) {
      console.error(`Insert failed for chunk ${i + 1}:`, err.message);
    }
  }

  console.log('Ingestion complete. Inserted:', inserted, '/', chunkCount);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
