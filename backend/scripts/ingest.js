require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
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
 * @param {string} text - Raw text to chunk
 * @param {number} chunkSize - Target chunk size in characters (default 500)
 * @returns {string[]} Array of text chunks
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

async function getEmbedding(text) {
  // TODO: Call Hugging Face Inference API for sentence-transformers/all-MiniLM-L6-v2
  throw new Error('Not implemented');
}

async function insertDocument(content, metadata, embedding) {
  // TODO: Insert into Supabase documents table
  throw new Error('Not implemented');
}

async function main() {
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

  console.log('PDF ingestion complete');
  console.log('Total characters:', totalChars);
  console.log('Number of chunks generated:', chunkCount);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
