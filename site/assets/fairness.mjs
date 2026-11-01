// Generated from apps/web/src/lib/fairness (the code the website's Verify tool runs).
// Do not edit by hand: rebuild it with `node build.mjs` from this folder.
// ../../apps/web/src/lib/fairness/sha256.ts
var K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var encoder = new TextEncoder();
var utf8 = (s) => encoder.encode(s);
function sha256(data) {
  const h = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  const bitLength = data.length * 8;
  const padded = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64);
  padded.set(data);
  padded[data.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 2 ** 32));
  view.setUint32(padded.length - 4, bitLength >>> 0);
  const w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const a2 = w[i - 15];
      const b2 = w[i - 2];
      const s0 = (a2 >>> 7 | a2 << 25) ^ (a2 >>> 18 | a2 << 14) ^ a2 >>> 3;
      const s1 = (b2 >>> 17 | b2 << 15) ^ (b2 >>> 19 | b2 << 13) ^ b2 >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f ^ ~e & g;
      const t1 = hh + S1 + ch + K[i] + w[i] >>> 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + f >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setUint32(i * 4, h[i]);
  return out;
}
function hmacSha256(key, message) {
  let k = utf8(key);
  if (k.length > 64) k = sha256(k);
  const inner = new Uint8Array(64);
  const outer = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    inner[i] = (k[i] ?? 0) ^ 54;
    outer[i] = (k[i] ?? 0) ^ 92;
  }
  const msg = utf8(message);
  const first = new Uint8Array(64 + msg.length);
  first.set(inner);
  first.set(msg, 64);
  const innerHash = sha256(first);
  const second = new Uint8Array(64 + 32);
  second.set(outer);
  second.set(innerHash, 64);
  return sha256(second);
}
var toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
var sha256Hex = (text) => toHex(sha256(utf8(text)));

// ../../apps/web/src/lib/fairness/rng.ts
var FairRng = class _FairRng {
  constructor(serverSeed, clientSeed, nonce, label = "") {
    this.serverSeed = serverSeed;
    this.clientSeed = clientSeed;
    this.nonce = nonce;
    this.label = label;
  }
  serverSeed;
  clientSeed;
  nonce;
  label;
  block = null;
  offset = 0;
  cursor = 0;
  /** A number in [0, 1). */
  float() {
    if (!this.block || this.offset >= this.block.length) {
      const message = this.label ? `${this.clientSeed}:${this.nonce}:${this.label}:${this.cursor}` : `${this.clientSeed}:${this.nonce}:${this.cursor}`;
      this.block = hmacSha256(this.serverSeed, message);
      this.offset = 0;
      this.cursor++;
    }
    const b = this.block;
    const o = this.offset;
    const value = (b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3]) >>> 0;
    this.offset += 4;
    return value / 2 ** 32;
  }
  /** A whole number in [0, max). */
  int(max) {
    return Math.floor(this.float() * max);
  }
  /** A shuffled copy (Fisher–Yates from the end, one number per swap). */
  shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  /** `count` different picks from [0, size), in draw order. */
  sample(size, count) {
    return this.shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, count);
  }
  /** A separate stream for one part of the round, from the same seeds and nonce. */
  fork(label) {
    return new _FairRng(this.serverSeed, this.clientSeed, this.nonce, label);
  }
};

// ../../apps/web/src/lib/fairness/games.ts
var rngOf = (i) => new FairRng(i.serverSeed, i.clientSeed, i.nonce);
var fixed = (n, d = 2) => n.toFixed(d);
var num = (i, key, fallback) => {
  const v = Number(i.params[key]);
  return Number.isFinite(v) ? v : fallback;
};
var ordinal = (n) => `${n}`;
var SUIT = { s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663" };
var SUITS = ["s", "h", "d", "c"];
var RANK_NAME = { 11: "J", 12: "Q", 13: "K", 14: "A", 1: "A" };
var cardText = (c) => `${RANK_NAME[c.rank] ?? c.rank}${SUIT[c.suit]}`;
function deck(decks = 1) {
  const out = [];
  for (let d = 0; d < decks; d++)
    for (const suit of SUITS) for (let rank = 2; rank <= 14; rank++) out.push({ rank, suit });
  return out;
}
var DECK_TEXT = "The deck starts in a fixed order: spades, hearts, diamonds, clubs, each from 2 up to the ace. It is then shuffled with the **Fisher\u2013Yates** method. Starting from the last card, each card swaps places with a random card at or before it, picked with the next number: floor(number \xD7 (position + 1)).";
var DEFAULT_RTP_PARAM = {
  key: "rtp",
  label: "RTP (%)",
  min: 1,
  max: 100,
  step: 0.01,
  defaultValue: "99",
  rtp: true
};
var OUTCOMES_DICE = 1e4;
function diceGame(name) {
  return {
    method: `${name} uses the first number of the round.

- Roll = floor(number \xD7 10,000) \xF7 100, which gives a value from **0.00 to 99.99**, every value equally likely.
- You win when the roll lands in the range you picked.`,
    verify(i) {
      const roll = Math.floor(rngOf(i).float() * OUTCOMES_DICE) / 100;
      return [{ kind: "rows", rows: [{ label: "Roll", value: fixed(roll) }] }];
    }
  };
}
var MINES_SCORES = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  12,
  15,
  18,
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  60,
  70,
  80,
  90,
  100,
  120,
  150,
  200,
  250
];
var TWIST_STONE = 0.1;
var TWIST_BONUS = [100, 200, 300, 400, 500];
var COLORS = ["Yellow", "White", "Pink", "Blue", "Orange", "Green"];
var SPACE_MINES = { easy: 1, medium: 2, hard: 3, daredevil: 4 };
var countParam = (label, def, max) => ({
  key: "count",
  label,
  min: 1,
  max,
  step: 1,
  defaultValue: String(def)
});
var FAIR_GAMES = {
  dice: diceGame("Dice"),
  "classic-dice": diceGame("Classic Dice"),
  "hash-dice": {
    method: `Hash Dice uses the first number of the round.

- Roll = floor(number \xD7 100,000), a whole number from **0 to 99,999**, every value equally likely.
- High wins when the roll is above your target, Low when it's below.`,
    verify(i) {
      const roll = Math.floor(rngOf(i).float() * 1e5);
      return [{ kind: "rows", rows: [{ label: "Roll", value: roll.toLocaleString("en-US") }] }];
    }
  },
  limbo: {
    method: `Limbo turns the round's first number into a multiplier.

- Multiplier = (RTP \xF7 100) \xF7 (1 \u2212 number), rounded **down** to two decimals.
- It's never below 1.00\xD7 and is capped at 1,000,000\xD7.
- You win when the multiplier reaches your target.

With 99% RTP the chance of reaching a target is 99% \xF7 target: 49.5% for 2\xD7, 9.9% for 10\xD7.`,
    params: [DEFAULT_RTP_PARAM],
    verify(i) {
      const edge = Number((100 - num(i, "rtp", 99)).toFixed(4));
      const raw = (1 - edge / 100) / (1 - rngOf(i).float());
      const result = Math.max(1, Math.floor(Math.min(raw, 1e6) * 100) / 100);
      return [{ kind: "rows", rows: [{ label: "Multiplier", value: `${fixed(result)}\xD7` }] }];
    }
  },
  crash: {
    roundSeed: true,
    method: `Every Crash round has its own server seed, made at random. Its SHA-256 hash is shown before betting opens, and the seed itself is published as soon as the round crashes, so nobody can change a round once bets are in.

- Take HMAC_SHA256(server seed, "crash:" + round number).
- From the first 52 bits of it make a number: u = first 52 bits \xF7 2\u2075\xB2.
- Crash point = floor(RTP \xD7 100 \xF7 (1 \u2212 u)) \xF7 100, so two decimals, rounded **down**.
- It's never below 1.00\xD7 and is capped at 10,000\xD7.

With 99% RTP, a round reaches 2\xD7 about 49.5% of the time and 10\xD7 about 9.9% of the time.`,
    params: [DEFAULT_RTP_PARAM],
    verify(i) {
      const edge = Number((100 - num(i, "rtp", 99)).toFixed(4));
      const d = hmacSha256(i.serverSeed, `crash:${i.nonce}`);
      const word = (o) => (d[o] << 24 | d[o + 1] << 16 | d[o + 2] << 8 | d[o + 3]) >>> 0;
      const u = (word(0) * 2 ** 20 + (word(4) >>> 12)) / 2 ** 52;
      const point = Math.min(1e4, Math.max(1, Math.floor(100 * (1 - edge / 100) / (1 - u)) / 100));
      return [
        {
          kind: "rows",
          rows: [
            { label: "u", value: u.toFixed(12) },
            { label: "Crash point", value: `${fixed(point)}\xD7` }
          ]
        }
      ];
    }
  },
  plinko: {
    method: `The ball hits one peg per row, and each bounce uses the next number.

- A number below 0.5 sends it **left**, 0.5 or above sends it **right**.
- The slot it lands in is the number of right bounces: 0 is the far left slot, and with 16 rows, 16 is the far right one.
- The slot's multiplier is printed under it in the game.`,
    params: [
      {
        key: "rows",
        label: "Rows",
        options: Array.from({ length: 9 }, (_, k) => ({ value: String(k + 8), label: `${k + 8} rows` })),
        defaultValue: "16"
      }
    ],
    verify(i) {
      const rows = num(i, "rows", 16);
      const rng = rngOf(i);
      const path = Array.from({ length: rows }, () => rng.float() < 0.5 ? "L" : "R");
      const slot = path.filter((p) => p === "R").length;
      return [
        {
          kind: "rows",
          rows: [
            { label: "Path", value: path.join(" ") },
            { label: "Slot (from the left)", value: String(slot) }
          ]
        }
      ];
    }
  },
  mines: {
    method: `The board's 30 tiles hide the values 0, 1, 2 \u2026 250, each once, and the round's numbers shuffle them before you open anything.

- The values start in order, smallest first, and are shuffled with the **Fisher\u2013Yates** method: going from the last place to the second, each value swaps with a random place at or before it, chosen with one number: floor(number \xD7 (place + 1)).
- Tiles are then numbered row by row, 6 per row, starting top left.`,
    verify(i) {
      const tiles = rngOf(i).shuffle(MINES_SCORES);
      return [
        {
          kind: "grid",
          title: "The board",
          columns: 6,
          cells: tiles.map((v) => ({ text: String(v), tone: v === 0 ? "bad" : "plain" }))
        }
      ];
    }
  },
  "ring-of-fortune": {
    method: `The wheel's segments are numbered in order around the wheel, starting from 0.

- Winning segment = floor(first number \xD7 number of segments).
- Each segment shows its multiplier on the wheel.`,
    params: [
      {
        key: "segments",
        label: "Segments",
        options: [10, 20, 30, 40, 50].map((n) => ({ value: String(n), label: `${n} segments` })),
        defaultValue: "30"
      }
    ],
    verify(i) {
      const segments = num(i, "segments", 30);
      const index = rngOf(i).int(segments);
      return [{ kind: "rows", rows: [{ label: "Winning segment", value: `#${index}` }] }];
    }
  },
  roulette: {
    method: `European roulette, with one zero.

- Number = floor(first number \xD7 37), so **0 to 36**, every number equally likely.
- Your bets are paid on that number as on a real table.`,
    verify(i) {
      const n = rngOf(i).int(37);
      return [{ kind: "rows", rows: [{ label: "Winning number", value: String(n) }] }];
    }
  },
  keno: {
    method: `10 numbers are drawn from 1 to 40, without repeats.

- The numbers 1\u201340 are shuffled with the round's numbers (Fisher\u2013Yates, as in the card games), and the first 10 are the draw.
- The result is shown smallest first; your hits are the picks among them.`,
    verify(i) {
      const drawn = rngOf(i).sample(40, 10).map((n) => n + 1).sort((a, b) => a - b);
      return [{ kind: "numbers", title: "Numbers drawn", numbers: drawn }];
    }
  },
  "color-game": {
    method: `Three dice, each with six colours: yellow, white, pink, blue, orange and green.

- Each die = floor(next number \xD7 6), counted in that colour order (0 is yellow, 5 is green).`,
    verify(i) {
      const rng = rngOf(i);
      const dice = Array.from({ length: 3 }, () => COLORS[rng.int(6)]);
      return [
        { kind: "rows", rows: dice.map((c, k) => ({ label: `Die ${ordinal(k + 1)}`, value: c })) }
      ];
    }
  },
  "space-travel": {
    method: `The flight has 5 stages of 5 planets. Before you pick anything, the round's numbers decide which planets in each stage are mined: 1 on Easy, 2 on Medium, 3 on Hard and 4 on Daredevil.

- For each stage in turn, the five planets are shuffled (Fisher\u2013Yates) and the first ones are mined.
- Planets are numbered 1\u20135 from the top.`,
    params: [
      {
        key: "difficulty",
        label: "Difficulty",
        options: Object.keys(SPACE_MINES).map((d) => ({
          value: d,
          label: d[0].toUpperCase() + d.slice(1)
        })),
        defaultValue: "medium"
      }
    ],
    verify(i) {
      const mines = SPACE_MINES[i.params.difficulty ?? "medium"] ?? 2;
      const rng = rngOf(i);
      const rows = Array.from({ length: 5 }, (_, s) => {
        const hidden = rng.sample(5, mines).map((n) => n + 1).sort((a, b) => a - b);
        return { label: `Stage ${s + 1}`, value: `mined: ${hidden.join(", ")}` };
      });
      return [{ kind: "rows", rows }];
    }
  },
  "stellar-rush": {
    method: `A run is 36 hops long. Each hop uses the next number, and they're all decided before you start.

- A hop survives when its number is **below** that hop's survival chance, which the game shows for your difficulty.
- The run ends at the first hop that doesn't survive.`,
    verify(i) {
      const rng = rngOf(i);
      return [
        {
          kind: "rows",
          title: "Number for each hop",
          rows: Array.from({ length: 36 }, (_, k) => ({
            label: `Hop ${k + 1}`,
            value: rng.float().toFixed(6)
          }))
        }
      ];
    }
  },
  hilo: {
    method: `Cards are drawn with replacement, so every card can come up at any time. Each card has its own stream, named after when it's dealt:

- The **first card** uses the stream "open:0" (and "open:1", "open:2"\u2026 after each skip). It's always 4 to 10: rank = 4 + floor(number \xD7 7).
- The card after your **1st, 2nd, 3rd\u2026 call** uses "call:1", "call:2"\u2026: rank = 1 + floor(number \xD7 13), where 1 is the ace and 11, 12, 13 are J, Q, K.
- The suit is the next number of the same stream: floor(number \xD7 4), in the order \u2660 \u2665 \u2666 \u2663.`,
    params: [countParam("Calls to show", 10, 50)],
    verify(i) {
      const rng = rngOf(i);
      const card = (r, min, ranks) => ({
        rank: min + r.int(ranks),
        suit: SUITS[r.int(4)]
      });
      const count = Math.min(50, Math.max(1, num(i, "count", 10)));
      return [
        { kind: "cards", title: "First card", cards: [cardText(card(rng.fork("open:0"), 4, 7))] },
        {
          kind: "cards",
          title: "After each call",
          cards: Array.from(
            { length: count },
            (_, k) => cardText(card(rng.fork(`call:${k + 1}`), 1, 13))
          )
        }
      ];
    }
  },
  twist: {
    method: `Each spin has its own stream, "spin:1", "spin:2"\u2026

- The first number picks what you hit: below 0.1 a **stone**, then green up to 0.6, orange up to 0.85, purple above.
- The second number picks the purple bonus: 100, 200, 300, 400 or 500, floor(number \xD7 5).
- The third decides whether a ring hit becomes a gem; the chance depends on how far that colour has climbed and is shown in the game.`,
    params: [countParam("Spins to show", 10, 50)],
    verify(i) {
      const rng = rngOf(i);
      const count = Math.min(50, Math.max(1, num(i, "count", 10)));
      const rows = Array.from({ length: count }, (_, k) => {
        const r = rng.fork(`spin:${k + 1}`);
        const roll = r.float();
        const hit = roll < TWIST_STONE ? "Stone" : roll < TWIST_STONE + 0.5 ? "Green" : roll < TWIST_STONE + 0.75 ? "Orange" : "Purple";
        const bonus = TWIST_BONUS[Math.floor(r.float() * TWIST_BONUS.length)];
        const gem = hit === "Stone" ? "" : ` \xB7 gem roll ${r.float().toFixed(4)}`;
        return {
          label: `Spin ${k + 1}`,
          value: `${hit}${gem} \xB7 purple bonus ${bonus}`,
          tone: hit === "Stone" ? "bad" : "plain"
        };
      });
      return [{ kind: "rows", rows }];
    }
  },
  "coin-flip": {
    method: `Each flip has its own stream, "flip:1", "flip:2"\u2026

- Its first number decides the coin: **below 0.5 it lands on the side you called**, 0.5 or above on the other side.`,
    params: [countParam("Flips to show", 10, 50)],
    verify(i) {
      const rng = rngOf(i);
      const count = Math.min(50, Math.max(1, num(i, "count", 10)));
      const rows = Array.from({ length: count }, (_, k) => {
        const v = rng.fork(`flip:${k + 1}`).float();
        const yours = v < 0.5;
        return {
          label: `Flip ${k + 1}`,
          value: `${v.toFixed(4)} \xB7 ${yours ? "your call" : "the other side"}`,
          tone: yours ? "good" : "bad"
        };
      });
      return [{ kind: "rows", rows }];
    }
  },
  "bubble-shooter": {
    method: `One shot, one number.

- The bubble breaks when the first number of the round is **below** its break chance, which the game shows for the bubble you aim at.
- A mystery bubble or the jackpot uses the next number to pick its prize from the ones listed.`,
    verify(i) {
      return [{ kind: "rows", rows: [{ label: "Shot number", value: rngOf(i).float().toFixed(6) }] }];
    }
  },
  bingo: {
    method: `20 balls are drawn from 1 to 50, in the order shown in the game.

- The balls come from the stream "balls": the numbers 1\u201350 are shuffled (Fisher\u2013Yates) and the first 20 are drawn.
- Cards the game deals for you come from the stream "cards": 24 different numbers for each card, around a free centre, filled row by row.`,
    params: [countParam("Cards dealt", 1, 4)],
    verify(i) {
      const rng = rngOf(i);
      const balls = rng.fork("balls").sample(50, 20).map((n) => n + 1);
      const dealer = rng.fork("cards");
      const count = Math.min(4, Math.max(1, num(i, "count", 1)));
      const cards = Array.from({ length: count }, (_, k) => {
        const numbers = dealer.sample(50, 24).map((n) => n + 1);
        const cells = [...numbers.slice(0, 12), 0, ...numbers.slice(12)];
        return {
          kind: "grid",
          title: `Card ${k + 1}`,
          columns: 5,
          cells: cells.map((n) => ({
            text: n === 0 ? "FREE" : String(n),
            tone: n === 0 || balls.includes(n) ? "good" : "plain"
          }))
        };
      });
      return [{ kind: "numbers", title: "Balls, in draw order", numbers: balls }, ...cards];
    }
  },
  baccarat: {
    method: `Played from a shoe of **8 decks** (416 cards), shuffled for every round.

${DECK_TEXT}

- Cards are dealt from the top: player, player, banker, banker, then any third cards by the usual baccarat rules, player first.`,
    verify(i) {
      const shoe = rngOf(i).shuffle(deck(8));
      return [{ kind: "cards", title: "Top of the shoe", cards: shoe.slice(0, 6).map(cardText) }];
    }
  },
  "dragon-phoenix": {
    method: `One deck, shuffled for every round.

${DECK_TEXT}

- The first three cards are the Dragon's hand, the next three the Phoenix's.`,
    verify(i) {
      const d = rngOf(i).shuffle(deck());
      return [
        { kind: "cards", title: "Dragon", cards: d.slice(0, 3).map(cardText) },
        { kind: "cards", title: "Phoenix", cards: d.slice(3, 6).map(cardText) }
      ];
    }
  },
  "caribbean-poker": {
    method: `One deck, shuffled for every round, so every card, the dealer's hidden ones included, is fixed before you decide.

${DECK_TEXT}

- The first five cards are your hand, the next five the dealer's.`,
    verify(i) {
      const d = rngOf(i).shuffle(deck());
      return [
        { kind: "cards", title: "Your hand", cards: d.slice(0, 5).map(cardText) },
        { kind: "cards", title: "Dealer", cards: d.slice(5, 10).map(cardText) }
      ];
    }
  },
  "oasis-poker": {
    method: `One deck, shuffled for every round, so every card, the dealer's hidden ones and your replacements included, is fixed before you decide.

${DECK_TEXT}

- The first five cards are your hand, the next five the dealer's, and the five after that are the replacements you draw from, in order.`,
    verify(i) {
      const d = rngOf(i).shuffle(deck());
      return [
        { kind: "cards", title: "Your hand", cards: d.slice(0, 5).map(cardText) },
        { kind: "cards", title: "Dealer", cards: d.slice(5, 10).map(cardText) },
        { kind: "cards", title: "Replacements", cards: d.slice(10, 15).map(cardText) }
      ];
    }
  },
  "video-poker": {
    method: `One deck, shuffled for every round from the stream "deck".

${DECK_TEXT}

- The first five cards are dealt. The cards you don't hold are replaced, in order, by the cards that follow.
- When you play several hands, hand 2, 3\u2026 redraws from the same remaining cards, shuffled again with the stream "hand:2", "hand:3"\u2026`,
    verify(i) {
      const d = rngOf(i).fork("deck").shuffle(deck());
      return [
        { kind: "cards", title: "Dealt", cards: d.slice(0, 5).map(cardText) },
        { kind: "cards", title: "Replacements (hand 1)", cards: d.slice(5, 10).map(cardText) }
      ];
    }
  }
};
var STREAM_TEXT = `Every round's numbers come from three values:

- the **server seed**, made by us at random. You see its SHA-256 hash before you bet.
- the **client seed**, which is yours to change at any time.
- the **nonce**, which counts your bets: 1, 2, 3 and so on.

They're combined with HMAC-SHA256, a standard way of hashing: HMAC_SHA256(server seed, "client seed:nonce:0"). That gives 32 bytes. Every 4 bytes, divided by 2\xB3\xB2, make a number between 0 and 1, so one hash gives eight numbers. If a round needs more, the 0 at the end becomes 1, then 2, and so on. When a game's method says "the next number", it means the next one in this list.

Some parts of a round have their own list, with a name added: "client seed:nonce:name:0". That way, one part of a round never shifts another.

When you change your seeds, the old server seed is revealed. Check that its hash matches the one you were shown, then check any round with the Verify tool below.`;
export {
  FAIR_GAMES,
  FairRng,
  STREAM_TEXT,
  hmacSha256,
  sha256Hex,
  toHex
};
