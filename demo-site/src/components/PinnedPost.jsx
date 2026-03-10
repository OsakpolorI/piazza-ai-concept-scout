const PINNED_CONTAINER = {
  padding: '24px 0',
  marginBottom: '24px',
  borderBottom: '2px solid #e5e7eb',
};

const PINNED_BADGE = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#fef08a',
  color: '#854d0e',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  marginBottom: '12px',
  textTransform: 'uppercase',
};

const PINNED_TITLE = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: '12px',
};

const PINNED_BODY = {
  fontSize: '14px',
  lineHeight: 1.8,
  color: '#374151',
  marginBottom: '16px',
};

const SECTION = {
  marginBottom: '16px',
};

const SECTION_TITLE = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#3b82f6',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const SECTION_TEXT = {
  fontSize: '14px',
  color: '#555',
  lineHeight: 1.6,
};

const CODE_BLOCK = {
  display: 'inline-block',
  padding: '2px 8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#1f2937',
};

function PinnedPost() {
  return (
    <div style={PINNED_CONTAINER}>
      <div style={PINNED_BADGE}>📌 Pinned</div>
      <h1 style={PINNED_TITLE}>Welcome to Piazza AI Concept Scout</h1>

      <div style={PINNED_BODY}>
        This is a live demonstration of an AI-powered research assistant that helps CS students understand course concepts by searching lecture notes and providing context-grounded explanations.
      </div>

      <div style={SECTION}>
        <div style={SECTION_TITLE}>How This Demo Works</div>
        <div style={SECTION_TEXT}>
          <strong>1. Sample Posts:</strong> The CS concepts below are based on real course materials. Click "Explain Concept" to see AI explanations grounded in lecture notes.
          <br /><br />
          <strong>2. Create Your Own:</strong> Scroll down to the form at the bottom to write a custom question or topic. The AI will search the knowledge base for relevant content.
          <br /><br />
          <strong>3. RAG Pipeline:</strong> The system uses semantic search (vector embeddings) to find relevant lecture chunks, then passes them to an LLM to generate explanations. <strong>If your question doesn't match the course materials, the AI will indicate that.</strong>
        </div>
      </div>

      <div style={SECTION}>
        <div style={SECTION_TITLE}>Try It Out</div>
        <div style={SECTION_TEXT}>
          ✓ Click <span style={CODE_BLOCK}>Explain Concept</span> on any post below.<br />
          ✓ Write your own question in the form at the bottom.<br />
          ✓ Test with off-topic questions to see how the system handles content outside the knowledge base.
        </div>
      </div>

      <div style={SECTION}>
        <div style={SECTION_TITLE}>What You're Seeing</div>
        <div style={SECTION_TEXT}>
          The side panel shows: <strong>Explanation</strong> (AI-generated), <strong>Prerequisite Bridge</strong> (context refresher), <strong>Reflection Questions</strong> (for deeper learning), and <strong>References</strong> (sources from the knowledge base).
        </div>
      </div>
    </div>
  );
}

export default PinnedPost;
