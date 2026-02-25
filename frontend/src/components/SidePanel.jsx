function SidePanel({ onClose }) {
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
        transform: 'translateX(0)',
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
      <p style={{ marginTop: '32px', color: '#666', fontSize: '14px' }}>
        Explanation will appear here.
      </p>
    </div>
  );
}

export default SidePanel;
