const express = require('express');
const cors = require('cors');

const explainRoutes = require('./routes/explainRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/explain', explainRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
