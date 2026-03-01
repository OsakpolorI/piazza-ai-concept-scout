const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const express = require('express');
const cors = require('cors');

const explainRoutes = require('./routes/explainRoutes');

const allowedOrigins = [
  'http://localhost:5173',
  'https://piazza.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/explain', explainRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
