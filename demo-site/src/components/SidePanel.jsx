const BRAND = '#3b82f6';

const SECTION_STYLE = {
  marginBottom: '16px',
  padding: '12px 12px 12px 16px',
  borderLeft: `4px solid ${BRAND}`,
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  fontSize: '14px',
};

const SECTION_TITLE_STYLE = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#475569',
};

const SECTION_BODY_STYLE = {
  color: '#334155',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6,
};

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div style={SECTION_STYLE}>
      <strong style={SECTION_TITLE_STYLE}>{title}</strong>
      <div style={SECTION_BODY_STYLE}>{content}</div>
    </div>
  );
}

function SectionList({ title, items }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  return (
    <div style={SECTION_STYLE}>
      <strong style={SECTION_TITLE_STYLE}>{title}</strong>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', lineHeight: 1.6 }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReferencesSection({ references }) {
  if (!references || !Array.isArray(references) || references.length === 0) return null;

  return (
    <div style={SECTION_STYLE}>
      <strong style={SECTION_TITLE_STYLE}>References</strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {references.map((ref, i) => {
          if (typeof ref === 'object' && ref !== null && 'filename' in ref) {
            return (
              <div
                key={i}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#1e40af' }}>
                  {ref.filename}
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Chunk {ref.chunk_index} — context marker
                </span>
              </div>
            );
          }
          return (
            <div key={i} style={{ padding: '6px 0', fontSize: '13px', color: '#334155' }}>
              {String(ref)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
      <div
        className="piazza-ai-scout-spinner"
        style={{
          width: '32px',
          height: '32px',
          border: `3px solid #e2e8f0`,
          borderTopColor: BRAND,
          borderRadius: '50%',
        }}
      />
      <p style={{ color: '#64748b', fontSize: '14px' }}>Loading explanation...</p>
    </div>
  );
}

function ErrorMessage({ children }) {
  return (
    <div
      style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        color: '#991b1b',
        fontSize: '14px',
      }}
    >
      {children}
    </div>
  );
}

const PANEL_STYLES = `
  .piazza-ai-scout-panel .piazza-ai-scout-spinner {
    animation: piazza-ai-scout-spin 0.8s linear infinite;
  }
  @keyframes piazza-ai-scout-spin {
    to { transform: rotate(360deg); }
  }
  .piazza-ai-scout-panel button.piazza-ai-scout-close:hover {
    background-color: rgba(255,255,255,0.35) !important;
  }
  .piazza-ai-scout-panel::-webkit-scrollbar {
    width: 6px;
  }
  .piazza-ai-scout-panel::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .piazza-ai-scout-panel::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

function SidePanel({ onClose, state, data }) {
  const messageStyle = { marginTop: '32px', color: '#64748b', fontSize: '14px' };

  let content;
  if (state === 'extract_error') {
    content = <ErrorMessage>Could not extract post content.</ErrorMessage>;
  } else if (state === 'loading') {
    content = <LoadingSpinner />;
  } else if (state === 'fetch_error') {
    content = <ErrorMessage>Error fetching explanation.</ErrorMessage>;
  } else if (state === 'success' && data) {
    content = (
      <div style={{ marginTop: '24px' }}>
        <Section title="Explanation" content={data.explanation} />
        <Section title="Prerequisite Bridge" content={data.prerequisite_bridge} />
        <SectionList title="Reflection Questions" items={data.reflection_questions} />
        <Section title="Ask Professor" content={data.ask_prof} />
        <ReferencesSection references={data.references} />
      </div>
    );
  } else {
    content = <p style={messageStyle}>Explanation will appear here.</p>;
  }

  return (
    <div
      className="piazza-ai-scout-panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#fff',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        zIndex: 999998,
        overflowY: 'auto',
      }}
    >
      <style>{PANEL_STYLES}</style>
      <div
        style={{
          height: '48px',
          backgroundColor: BRAND,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 20px',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Concept Scout</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="piazza-ai-scout-close"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: '24px' }}>{content}</div>
    </div>
  );
}

export default SidePanel;
