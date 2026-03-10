import { useState } from 'react';

const FORM_CONTAINER = {
  padding: '24px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  marginTop: '24px',
};

const FORM_TITLE = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#1e40af',
  marginBottom: '16px',
};

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontFamily: 'inherit',
  marginBottom: '12px',
  outline: 'none',
};

const TEXTAREA_STYLE = {
  width: '100%',
  minHeight: '100px',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  marginBottom: '12px',
};

const BUTTON_STYLE = {
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#fff',
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function CreatePostForm({ onPostCreate }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && body.trim()) {
      setIsSubmitting(true);
      onPostCreate({ title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      setIsSubmitting(false);
    }
  };

  return (
    <form style={FORM_CONTAINER} onSubmit={handleSubmit}>
      <div style={FORM_TITLE}>💬 Create Your Own Post</div>
      <div>
        <label style={LABEL_STYLE}>Question Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What is a hash table?"
          style={INPUT_STYLE}
          maxLength={200}
        />
      </div>
      <div>
        <label style={LABEL_STYLE}>Question Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe your question or topic here..."
          style={TEXTAREA_STYLE}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || !body.trim()}
        style={{
          ...BUTTON_STYLE,
          opacity: isSubmitting || !title.trim() || !body.trim() ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting && title.trim() && body.trim()) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#3b82f6';
        }}
      >
        Post Question
      </button>
    </form>
  );
}

export default CreatePostForm;
