const path = require('path');
const { searchSimilarDocuments } = require('../services/vectorService');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_MODEL = 'gemini-1.5-flash';

const NO_MATCHES_RESPONSE = {
  explanation: 'No relevant lecture content found for this question. Try rephrasing or ask your professor.',
  prerequisite_bridge: '',
  reflection_questions: ['What specific part of the topic are you confused about?'],
  ask_prof: 'Consider reaching out to your professor or TA during office hours.',
  references: [],
};

const GROQ_FAILURE_RESPONSE = {
  explanation: 'Unable to generate explanation at the moment. Please try again later.',
  prerequisite_bridge: '',
  reflection_questions: [],
  ask_prof: '',
  references: [],
};

/**
 * Failover improves availability: when one provider is rate-limited (429), overloaded (5xx),
 * or unreachable (network error), we automatically switch to a backup. Students get explanations
 * instead of generic error messages.
 *
 * Cost-efficient for MVP: Groq and Gemini both offer generous free tiers. Using Groq first
 * (fast, free) and Gemini as fallback avoids paid overages while maximizing uptime.
 */

async function explainPost(req, res) {
  const text = req.body?.text;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }

  console.debug('[Piazza AI] Received text:', text?.slice(0, 80) + (text?.length > 80 ? '...' : ''));

  try {
    const matches = await searchSimilarDocuments(text);

    if (!matches || matches.length === 0) {
      return res.json(NO_MATCHES_RESPONSE);
    }

    const lectureChunks = matches.map((m) => m.content || '').filter(Boolean);
    const chunksText = lectureChunks.map((c, i) => `[Chunk ${i + 1}]\n${c}`).join('\n\n');

    const prompt = `You are a CS1 teaching assistant. Answer the student question using ONLY the lecture notes below. Return ONLY valid JSON, no markdown or extra text.

Student question:
${text}

Lecture notes:
${chunksText}

Return exactly this JSON structure (no other text):
{"explanation":"...","prerequisite_bridge":"...","reflection_questions":["...","..."],"ask_prof":"...","references":["..."]}`;

    let rawContent = null;

    // Primary: Groq (fast, free tier). Catch 429, 5xx, network errors and fail over to Gemini.
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error('Missing GROQ_API_KEY');

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
      });

      if (!groqResponse.ok) {
        const status = groqResponse.status;
        const errText = await groqResponse.text();

        if (status === 429 || status >= 500) {
          console.log('[LLM] Groq failed, switching to Gemini...', `(${status}: ${errText?.slice(0, 80)})`);
          throw new Error(`Groq ${status}`);
        }

        console.error('[Piazza AI] Groq API error:', status, errText);
        return res.json(GROQ_FAILURE_RESPONSE);
      }

      const groqData = await groqResponse.json();
      rawContent = groqData?.choices?.[0]?.message?.content;
    } catch (groqErr) {
      const isRetriable =
        groqErr?.message?.includes('429') ||
        groqErr?.message?.includes('5') ||
        groqErr?.code === 'ECONNREFUSED' ||
        groqErr?.code === 'ETIMEDOUT' ||
        groqErr?.name === 'TypeError';

      if (isRetriable) {
        console.log('[LLM] Groq failed, switching to Gemini...', groqErr.message);
        rawContent = await callGemini(prompt);
      } else {
        console.error('[Piazza AI] Groq error:', groqErr.message);
        return res.json(GROQ_FAILURE_RESPONSE);
      }
    }

    if (!rawContent) {
      console.error('[Piazza AI] No LLM content returned');
      return res.json(GROQ_FAILURE_RESPONSE);
    }

    const parsed = parseStructuredResponse(rawContent);
    if (!parsed) {
      console.error('[Piazza AI] Failed to parse LLM JSON. Raw (first 300 chars):', rawContent?.slice(0, 300));
      return res.json(GROQ_FAILURE_RESPONSE);
    }

    res.json({
      explanation: parsed.explanation ?? '',
      prerequisite_bridge: parsed.prerequisite_bridge ?? '',
      reflection_questions: Array.isArray(parsed.reflection_questions) ? parsed.reflection_questions : [],
      ask_prof: parsed.ask_prof ?? '',
      references: Array.isArray(parsed.references) ? parsed.references : [],
    });
  } catch (err) {
    console.error('[Piazza AI] explainPost error:', err.message);
    return res.json(GROQ_FAILURE_RESPONSE);
  }
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Piazza AI] Missing GEMINI_API_KEY for failover');
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Piazza AI] Gemini API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    console.error('[Piazza AI] Gemini failover error:', err.message);
    return null;
  }
}

/**
 * Extract and parse JSON from LLM response (may be wrapped in ```json blocks or have extra text).
 */
function parseStructuredResponse(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    let jsonStr = raw.trim();

    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) jsonStr = braceMatch[0];

    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

module.exports = { explainPost };
