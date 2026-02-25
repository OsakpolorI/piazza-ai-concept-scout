import { useState } from 'react';
import ExplainButton from './components/ExplainButton';
import SidePanel from './components/SidePanel';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ExplainButton onClick={() => setIsOpen(true)} />
      {isOpen && <SidePanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default App;
