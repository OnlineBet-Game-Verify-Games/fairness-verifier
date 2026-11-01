// OnlineBet.Game verifier page. Everything runs in your browser; nothing is sent anywhere.
import { FAIR_GAMES, STREAM_TEXT, sha256Hex } from './fairness.mjs';
import { GAMES, SITE } from './games.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** The site's light formatting: blank line = paragraph, "- " = list, **bold**. */
function rich(text) {
  const inline = (l) => esc(l).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return text.split(/\n\s*\n/).map((block) => {
    const lines = block.trim().split('\n');
    if (lines.every((l) => /^\s*-\s+/.test(l)))
      return '<ul>' + lines.map((l) => `<li>${inline(l.replace(/^\s*-\s+/, ''))}</li>`).join('') + '</ul>';
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

const slug = document.body.dataset.game;
const game = FAIR_GAMES[slug];
const name = GAMES.find((g) => g.slug === slug)?.name ?? slug;

$('#switch').innerHTML = GAMES.map((g) => `<a href="${g.slug}.html"${g.slug === slug ? ' class="on"' : ''}>${esc(g.name)}</a>`).join('');
$('#method').innerHTML = rich(game.method);
$('#stream').innerHTML = game.roundSeed ? '' : `<div class="card"><h2>Where the numbers come from</h2><div class="text">${rich(STREAM_TEXT)}</div></div>`;
$('#site').href = SITE;

// The form: seeds, nonce (or Game ID for Crash), and the game's own settings.
const params = game.params ?? [];
const field = (id, label, extra = '', cls = '') =>
  `<div class="${cls}"><label for="${id}">${label}</label><input id="${id}" name="${id}" autocomplete="off" spellcheck="false" ${extra}></div>`;
$('#form').innerHTML =
  field('serverSeed', 'Server seed', 'class="mono"', 'full') +
  field('hash', 'Server seed hash (optional, to check it matches)', 'class="mono"', 'full') +
  (game.roundSeed ? '' : field('clientSeed', 'Client seed', 'class="mono"')) +
  field('nonce', game.roundSeed ? 'Game ID (round number)' : 'Nonce', 'inputmode="numeric"') +
  params.map((p) =>
    p.options
      ? `<div><label for="p-${p.key}">${esc(p.label)}</label><select id="p-${p.key}" name="p-${p.key}">${p.options.map((o) => `<option value="${esc(o.value)}"${o.value === p.defaultValue ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></div>`
      : field(`p-${p.key}`, esc(p.label), `type="number" value="${esc(p.defaultValue)}" step="${p.step ?? 1}" min="${p.min ?? ''}" max="${p.max ?? ''}"`),
  ).join('') +
  `<div class="full btns"><button type="submit">Verify</button><button type="button" class="ghost" id="example">Try an example</button></div>`;

// Values in the address fill the form: crash.html?serverSeed=…&nonce=…
const q = new URLSearchParams(location.search);
for (const k of ['serverSeed', 'hash', 'clientSeed', 'nonce']) if (q.get(k) && $('#' + k)) $('#' + k).value = q.get(k);
for (const p of params) if (q.get(p.key)) $('#p-' + p.key).value = q.get(p.key);

function render(blocks) {
  return blocks.map((b) => {
    const title = b.title ? `<h3>${esc(b.title)}</h3>` : '';
    if (b.kind === 'rows')
      return title + '<dl class="rows">' + b.rows.map((r) => `<dt>${esc(r.label)}</dt><dd class="tone-${r.tone ?? 'plain'}">${esc(r.value)}</dd>`).join('') + '</dl>';
    if (b.kind === 'cards')
      return title + '<div class="cards">' + b.cards.map((c) => `<span class="${/[♥♦]/.test(c) ? 'red' : ''}">${esc(c)}</span>`).join('') + '</div>';
    if (b.kind === 'numbers')
      return title + '<div class="balls">' + b.numbers.map((n) => `<span>${n}</span>`).join('') + '</div>';
    return title + `<div class="grid" style="grid-template-columns:repeat(${b.columns},1fr)">` + b.cells.map((c) => `<span class="tone-${c.tone ?? 'plain'}">${esc(c.text)}</span>`).join('') + '</div>';
  }).join('');
}

function run() {
  const serverSeed = $('#serverSeed').value.trim();
  const clientSeed = $('#clientSeed')?.value.trim() ?? '';
  const nonceText = $('#nonce').value.trim();
  const nonce = Number(nonceText);
  const out = $('#result');
  let html = '';
  if (serverSeed) {
    const h = sha256Hex(serverSeed);
    const given = $('#hash').value.trim().toLowerCase();
    html += `<div class="hash">SHA-256 of the server seed: <code>${h}</code>` +
      (given ? (given === h ? '<div class="ok">✓ Matches the hash you were shown.</div>' : '<div class="no">✗ Doesn’t match the hash you entered.</div>') : '') + '</div>';
  }
  const ready = serverSeed && nonceText !== '' && Number.isSafeInteger(nonce) && nonce >= 0 && (game.roundSeed || clientSeed);
  if (!ready) {
    out.innerHTML = html + `<p class="empty">Fill in the ${game.roundSeed ? 'server seed and Game ID' : 'server seed, client seed and nonce'} to see the result.</p>`;
    return;
  }
  const values = Object.fromEntries(params.map((p) => [p.key, $('#p-' + p.key).value]));
  out.innerHTML = html + '<div class="result">' + render(game.verify({ serverSeed, clientSeed, nonce, params: values })) + '</div>';
  const url = new URL(location.href);
  url.search = new URLSearchParams({ serverSeed, ...(clientSeed && { clientSeed }), nonce: nonceText, ...values }).toString();
  history.replaceState(null, '', url);
}

const hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, '0')).join('');
$('#example').addEventListener('click', () => {
  $('#serverSeed').value = hex(32);
  $('#hash').value = '';
  if ($('#clientSeed')) $('#clientSeed').value = hex(10);
  $('#nonce').value = game.roundSeed ? String(100000 + Math.floor(Math.random() * 900000)) : '1';
  run();
});
$('#form').addEventListener('submit', (e) => { e.preventDefault(); run(); });
$('#form').addEventListener('input', run);
run();
