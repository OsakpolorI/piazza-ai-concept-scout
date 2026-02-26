const path = require('path');
const { searchSimilarDocuments } = require('../services/vectorService');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

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

    const prompt = `You are a CS1 teaching assistant.
Answer the student question:

${text}

Use ONLY the following lecture notes:

${chunksText}

Return structured JSON with these exact keys (no other text):
- explanation: string
- prerequisite_bridge: string
- reflection_questions: array of strings
- ask_prof: string
- references: array of strings`;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.error('[Piazza AI] Missing GROQ_API_KEY');
      return res.json(GROQ_FAILURE_RESPONSE);
    }

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
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('[Piazza AI] Groq API error:', groqResponse.status, errText);
      return res.json(GROQ_FAILURE_RESPONSE);
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error('[Piazza AI] Groq returned empty content');
      return res.json(GROQ_FAILURE_RESPONSE);
    }

    const parsed = parseStructuredResponse(rawContent);
    if (!parsed) {
      console.error('[Piazza AI] Failed to parse Groq JSON response');
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

/**
 * Extract and parse JSON from LLM response (may be wrapped in ```json blocks).
 */
function parseStructuredResponse(raw) {
  try {
    let jsonStr = raw.trim();

    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    }

    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

module.exports = { explainPost };
