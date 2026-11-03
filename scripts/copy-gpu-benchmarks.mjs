// detect-gpu fetches benchmark JSON from unpkg by default. Serving it ourselves
// removes a third-party request on the path that decides whether a phone gets 3D.
import { cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules', 'detect-gpu', 'dist', 'benchmarks');
const to = join(root, 'public', 'benchmarks');

if (!existsSync(from)) {
  console.error(`GPU benchmarks not found at ${from}. Run npm install first.`);
  process.exit(1);
}

cpSync(from, to, { recursive: true });
