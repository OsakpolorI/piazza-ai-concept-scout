# Piazza AI Concept Scout — Demo Site

Standalone demo for recruiters. Shows a mock forum with editable posts and live AI explanations.

## Run

1. **Start the backend** (from project root):
   ```bash
   cd backend && node src/server.js
   ```

2. **Start the demo-site**:
   ```bash
   cd demo-site && npm run dev
   ```

3. Open http://localhost:5173

## Features

- 5 mock posts on generic CS fundamentals
- Editable title and body per post
- Explain Concept → live `POST /api/explain` per post
- Side panel with structured AI response
- Editing text and re-clicking Explain shows changed responses
