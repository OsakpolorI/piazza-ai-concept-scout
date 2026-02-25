import { createRoot } from 'react-dom/client';
import React from 'react';
import App from '../App';

const ROOT_ID = 'piazza-ai-scout-root';

function init() {
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const root = document.createElement('div');
  root.id = ROOT_ID;
  Object.assign(root.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 999999,
  });
  document.body.appendChild(root);

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
