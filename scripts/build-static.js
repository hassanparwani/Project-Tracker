const fs = require('fs');
const path = require('path');
const seed = require('../seed');

const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

fs.copyFileSync(
  path.join(__dirname, '..', 'index.html'),
  path.join(publicDir, 'index.html')
);

fs.writeFileSync(
  path.join(publicDir, 'seed.json'),
  JSON.stringify({
    items: seed.items,
    log: [
      {
        at: new Date().toISOString(),
        who: 'System',
        act: 'Seeded from 23-Nov meeting, Puja plan v2, payer slide',
        changes: [],
      },
    ],
  })
);
