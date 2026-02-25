const notes = require('../data/notes.json');

function explainPost(req, res) {
  const text = req.body?.text;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }

  console.debug('[Piazza AI] Received text:', text);

  const matchingNote = findMatchingNote(text, notes);

  const response = matchingNote
    ? {
        explanation: matchingNote.explanation,
        prerequisite_bridge: matchingNote.prerequisite_bridge,
        reflection_questions: matchingNote.reflection_questions || [],
        ask_prof: matchingNote.ask_prof,
        references: matchingNote.references || [],
      }
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
 * Find first note whose keywords appear in the given text.
 */
function findMatchingNote(text, noteList) {
  const textLower = text.toLowerCase();

  return noteList.find((note) => {
    const keywords = note.keywords || [];
    return keywords.some((kw) => textLower.includes(kw.toLowerCase()));
  });
}

module.exports = { explainPost };
