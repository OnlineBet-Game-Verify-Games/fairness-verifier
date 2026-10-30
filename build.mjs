// Rebuilds fairness.mjs from the website's verifier code (apps/web/src/lib/fairness), so the
// script on GitHub and the Verify tool on the site always run the same calculation.
// Run it from this folder whenever a game's maths changes:
//   node build.mjs
// It downloads esbuild once through npx, so it needs internet access.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const lib = fileURLToPath(new URL('../../apps/web/src/lib/fairness/', import.meta.url));
const entry = fileURLToPath(new URL('./.entry.ts', import.meta.url));
writeFileSync(
  entry,
  [
    `export { FAIR_GAMES, STREAM_TEXT } from ${JSON.stringify(lib + 'games.ts')};`,
    `export { FairRng } from ${JSON.stringify(lib + 'rng.ts')};`,
    `export { sha256Hex, hmacSha256, toHex } from ${JSON.stringify(lib + 'sha256.ts')};`,
  ].join('\n'),
);
execFileSync(
  'npx',
  [
    '--yes',
    'esbuild@0.25.10',
    entry,
    '--bundle',
    '--format=esm',
    '--platform=neutral',
    '--target=es2022',
    '--legal-comments=none',
    '--outfile=fairness.mjs',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);
const out = readFileSync('fairness.mjs', 'utf8');
writeFileSync(
  'fairness.mjs',
  "// Generated from apps/web/src/lib/fairness (the code the website's Verify tool runs).\n" +
    '// Do not edit by hand: rebuild it with `node build.mjs` from this folder.\n' +
    out,
);
console.log('fairness.mjs rebuilt');
