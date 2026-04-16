import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

const app = createApp({
  distDir: fs.existsSync(distDir) ? distDir : undefined,
});

const port = Number(process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`Scope Sieve listening on port ${port}`);
});
