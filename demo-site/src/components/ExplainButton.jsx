function ExplainButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#fff',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      }}
    >
      Explain Concept
    </button>
  );
}

export default ExplainButton;
