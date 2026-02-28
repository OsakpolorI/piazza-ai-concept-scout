import { useState } from 'react';
import ExplainButton from './ExplainButton';

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
  color: '#666',
  fontSize: '13px',
};

const TITLE_STYLE = {
  width: '100%',
  padding: '12px 0',
  fontSize: '20px',
  fontWeight: 600,
  border: 'none',
  borderBottom: '1px solid #e5e7eb',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
};

const BODY_STYLE = {
  width: '100%',
  minHeight: '120px',
  padding: '12px 0',
  fontSize: '14px',
  lineHeight: 1.6,
  border: 'none',
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
};

const META_STYLE = {
  color: '#999',
  fontSize: '12px',
  marginBottom: '12px',
};

const TAG_STYLE = {
  display: 'inline-block',
  padding: '2px 10px',
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '16px',
};

const BOTTOM_BAR = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid #e5e7eb',
};

function MockPost({
  initialTitle,
  initialBody,
  postId,
  onExplain,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const handleExplainClick = () => {
    const combinedText = title.trim() ? `${title.trim()}\n\n${body.trim()}` : body.trim();
    onExplain(combinedText);
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={HEADER_STYLE}>
        <span>question @{postId}</span>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        style={TITLE_STYLE}
      />
      <div style={META_STYLE}>Updated 2 days ago by Anonymous</div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post body..."
        style={BODY_STYLE}
      />
      <div style={TAG_STYLE}>concepts</div>
      <div style={BOTTOM_BAR}>
        <span style={{ color: '#999', fontSize: '12px' }}>95 views</span>
        <ExplainButton onClick={handleExplainClick} />
      </div>
    </div>
  );
}

export default MockPost;
