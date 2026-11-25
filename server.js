const path = require('path');
const express = require('express');
const seed = require('./seed');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/api/seed', (req, res) => {
  res.json({
    items: seed.items,
    log: [
      {
        at: new Date().toISOString(),
        who: 'System',
        act: 'Seeded from 23-Nov meeting, Puja plan v2, payer slide',
        changes: [],
      },
    ],
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
