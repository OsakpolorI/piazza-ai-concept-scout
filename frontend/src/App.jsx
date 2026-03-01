import { useState } from 'react';
import ExplainButton from './components/ExplainButton';
import SidePanel from './components/SidePanel';
import { extractPiazzaPost } from './utils/extractPiazzaPost';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/explain`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelState, setPanelState] = useState('idle'); // 'idle' | 'loading' | 'extract_error' | 'fetch_error' | 'success'
  const [panelData, setPanelData] = useState(null);

  const handleExplainClick = async () => {
    setPanelState('idle');
    setPanelData(null);
    setIsOpen(true);

    // Extraction: get title and body from Piazza DOM
    const post = extractPiazzaPost();
    if (!post) {
      setPanelState('extract_error');
      return;
    }

    // Debug logging for extraction verification (can be removed or disabled in production)
    console.debug('[Piazza AI] Extracted post:', post);

    setPanelState('loading');

    try {
      // API call: POST to backend with combined text
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.combinedText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      setPanelState('success');
      setPanelData(json);
    } catch {
      setPanelState('fetch_error');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPanelState('idle');
    setPanelData(null);
  };

  return (
    <>
      <ExplainButton onClick={handleExplainClick} />
      {isOpen && (
        <SidePanel
          onClose={handleClose}
          state={panelState}
          data={panelData}
        />
      )}
    </>
  );
}

export default App;
