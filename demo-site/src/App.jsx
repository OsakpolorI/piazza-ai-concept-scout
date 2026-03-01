import { useState } from 'react';
import Forum from './components/Forum';
import SidePanel from './components/SidePanel';

const API_BASE = import.meta.env.VITE_API_URL || 'https://piazza-scout.duckdns.org';
const API_URL = `${API_BASE}/api/explain`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelState, setPanelState] = useState('idle');
  const [panelData, setPanelData] = useState(null);

  const handleRequestExplain = async (combinedText) => {
    setIsOpen(true);
    setPanelData(null);

    const trimmed = (combinedText || '').trim();
    if (!trimmed) {
      setPanelState('extract_error');
      return;
    }

    setPanelState('loading');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
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
      <Forum onRequestExplain={handleRequestExplain} />
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
