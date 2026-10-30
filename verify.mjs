#!/usr/bin/env node
// OnlineBet.Game – provably fair verifier.
//
//   node verify.mjs <game> --server <server seed> --client <client seed> --nonce <n> [options]
//   node verify.mjs crash --server <server seed> --round <game id> [--rtp 99]
//   node verify.mjs list
//
// Needs Node.js 18 or newer and nothing else. See README.md.
import { FAIR_GAMES, sha256Hex } from './fairness.mjs';

const [game, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  const m = /^--([\w-]+)$/.exec(rest[i]);
  if (m) args[m[1]] = rest[++i] ?? '';
}

if (!game || game === 'list' || game === '--help') {
  console.log('Games:');
  for (const [slug, g] of Object.entries(FAIR_GAMES)) {
    const extra = (g.params ?? []).map((p) => ` [--${p.key} ${p.defaultValue}]`).join('');
    const base = g.roundSeed
      ? '--server <seed> --round <id>'
      : '--server <seed> --client <seed> --nonce <n>';
    console.log(`  ${slug.padEnd(16)} ${base}${extra}`);
  }
  process.exit(game ? 0 : 1);
}

const def = FAIR_GAMES[game];
if (!def) {
  console.error(`Unknown game "${game}". Run: node verify.mjs list`);
  process.exit(1);
}

const serverSeed = args.server ?? '';
const nonce = Number(def.roundSeed ? args.round : args.nonce);
if (!serverSeed || !Number.isSafeInteger(nonce) || (!def.roundSeed && !args.client)) {
  console.error(
    def.roundSeed
      ? 'Usage: node verify.mjs crash --server <seed> --round <game id> [--rtp 99]'
      : `Usage: node verify.mjs ${game} --server <seed> --client <seed> --nonce <n>`,
  );
  process.exit(1);
}

const params = {};
for (const p of def.params ?? []) params[p.key] = args[p.key] ?? p.defaultValue;

console.log(`Server seed SHA-256: ${sha256Hex(serverSeed)}`);
if (args.hash) {
  console.log(
    args.hash.toLowerCase() === sha256Hex(serverSeed)
      ? 'Hash: matches ✓'
      : 'Hash: DOES NOT MATCH ✗',
  );
}
console.log('');

const blocks = def.verify({ serverSeed, clientSeed: args.client ?? '', nonce, params });
for (const b of blocks) {
  if (b.title) console.log(`${b.title}:`);
  if (b.kind === 'rows') for (const r of b.rows) console.log(`  ${r.label}: ${r.value}`);
  if (b.kind === 'cards') console.log(`  ${b.cards.join('  ')}`);
  if (b.kind === 'numbers') console.log(`  ${b.numbers.join(', ')}`);
  if (b.kind === 'grid') {
    for (let i = 0; i < b.cells.length; i += b.columns) {
      console.log(
        '  ' +
          b.cells
            .slice(i, i + b.columns)
            .map((c) => c.text.padStart(4))
            .join(' '),
      );
    }
  }
}
