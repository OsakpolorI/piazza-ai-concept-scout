const SECTION_STYLE = {
  marginBottom: '16px',
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  fontSize: '14px',
};

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div style={SECTION_STYLE}>
      <strong style={{ display: 'block', marginBottom: '6px', color: '#333' }}>
        {title}
      </strong>
      <div style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  );
}

function SectionList({ title, items }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  return (
    <div style={SECTION_STYLE}>
      <strong style={{ display: 'block', marginBottom: '6px', color: '#333' }}>
        {title}
      </strong>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SidePanel({ onClose, state, data }) {
  const messageStyle = { marginTop: '32px', color: '#666', fontSize: '14px' };

  let content;
  if (state === 'extract_error') {
    content = <p style={messageStyle}>Could not extract post content.</p>;
  } else if (state === 'loading') {
    content = <p style={messageStyle}>Loading explanation...</p>;
  } else if (state === 'fetch_error') {
    content = <p style={messageStyle}>Error fetching explanation.</p>;
  } else if (state === 'success' && data) {
    content = (
      <div style={{ marginTop: '32px' }}>
        <Section title="Explanation" content={data.explanation} />
        <Section title="Prerequisite Bridge" content={data.prerequisite_bridge} />
        <SectionList title="Reflection Questions" items={data.reflection_questions} />
        <Section title="Ask Professor" content={data.ask_prof} />
        <SectionList title="References" items={data.references} />
      </div>
    );
  } else {
    content = <p style={messageStyle}>Explanation will appear here.</p>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#fff',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        zIndex: 999998,
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '8px',
          fontSize: '18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#666',
          lineHeight: 1,
        }}
      >
        ×
      </button>
      {content}
    </div>
  );
}

export default SidePanel;
