const notes = require('../data/notes.json');

function explainPost(req, res) {
  const text = req.body?.text;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }

  console.debug('[Piazza AI] Received text:', text);

  const matchingNote = findMatchingNote(text, notes);

  const response = matchingNote
    ? buildMockResponse(matchingNote)
    : {
        explanation: 'No matching content found for this post.',
        prerequisite_bridge: '',
        reflection_questions: [],
        ask_prof: '',
        references: [],
      };

  res.json(response);
}

/**
 * Extract keywords from title (e.g., "Week 1 - Memory Model" → ["week", "1", "memory", "model"])
 * and match against the incoming text.
 */
function findMatchingNote(text, noteList) {
  const textLower = text.toLowerCase();

  return noteList.find((note) => {
    const keywords = (note.title + ' ' + (note.body || ''))
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    return keywords.some((kw) => textLower.includes(kw));
  });
}

/**
 * Build structured mock response from a note with title and body.
 */
function buildMockResponse(note) {
  return {
    explanation: note.body || '',
    prerequisite_bridge: 'Review the course materials for related concepts.',
    reflection_questions: [
      'What part of this concept do you find most confusing?',
      'How does this connect to previous topics?',
    ],
    ask_prof: 'Consider asking your professor for clarification on any unclear points.',
    references: [note.title],
  };
}

module.exports = { explainPost };
