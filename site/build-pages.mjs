// Writes index.html and one page per game (crash.html, dice.html…), and copies the
// verifier code next to them. Run from this folder after any change: node build-pages.mjs
import { copyFileSync, writeFileSync } from 'node:fs';
import { GAMES, SITE } from './assets/games.js';

copyFileSync('../fairness.mjs', 'assets/fairness.mjs');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const head = (title, description) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="assets/style.css">
</head>`;

for (const g of GAMES) {
  writeFileSync(
    `${g.slug}.html`,
    `${head(`${g.name} verifier · OnlineBet.Game`, `Check any OnlineBet.Game ${g.name} round from its seeds. Runs in your browser.`)}
<body data-game="${g.slug}">
<div class="wrap">
  <header class="top"><h1>${esc(g.name)} · Provably fair verifier</h1><a class="home" href="index.html">All games</a></header>
  <nav class="switch" id="switch" aria-label="Games"></nav>
  <div class="card"><h2>Verify a round</h2>
    <p class="muted">Paste the values from your bet slip. The result is calculated right here in your browser; nothing is sent anywhere.</p>
    <form id="form"></form>
    <div id="result"></div>
  </div>
  <div class="card"><h2>How ${esc(g.name)} is calculated</h2><div class="text" id="method"></div></div>
  <div id="stream"></div>
  <footer>Open source: the same code as the Verify tool on <a id="site" href="${SITE}">OnlineBet.Game</a>.</footer>
</div>
<script type="module" src="assets/verify.js"></script>
</body>
</html>
`,
  );
}

writeFileSync(
  'index.html',
  `${head('Provably fair verifier · OnlineBet.Game', 'Check any OnlineBet.Game round yourself, game by game. Open source, runs in your browser.')}
<body>
<div class="wrap">
  <header class="top"><h1>OnlineBet.Game · Provably fair verifier</h1><a class="home" href="${SITE}/help/provably-fair">Provably Fair page</a></header>
  <div class="card">
    <p class="muted">Every OB Original works out its result from a server seed (you see its hash before you bet), your client seed and a nonce that counts your bets. Pick a game, paste the values from your bet slip, and see the same result the game gave you.</p>
    <ul class="games">
${GAMES.map((g) => `      <li><a href="${g.slug}.html">${esc(g.name)}</a></li>`).join('\n')}
    </ul>
  </div>
  <footer>Source code and command-line verifier: see this repository. Casino: <a href="${SITE}">OnlineBet.Game</a>.</footer>
</div>
</body>
</html>
`,
);
console.log(`Wrote index.html and ${GAMES.length} game pages.`);
