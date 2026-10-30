# OnlineBet.Game – provably fair verifier

Every result in our OB Originals comes from three values you can see:

- **server seed**: made by us at random; its SHA-256 hash is shown to you before you bet,
  and the seed itself is revealed when you change seeds,
- **client seed**: yours, change it whenever you like,
- **nonce**: counts your bets (1, 2, 3…).

This script repeats the game's calculation on your own computer, with nothing but those
values, so you can check that a round's result is exactly what the seeds say. It's the same
code the [Verify tool](https://onlinebet.game/help/provably-fair#verify) on the site runs.

## How the numbers are made

```
HMAC_SHA256(serverSeed, `${clientSeed}:${nonce}:${cursor}`)    cursor = 0, 1, 2…
```

Each 32-byte result gives eight numbers: four bytes each, read big-endian and divided by
2³², so every number is in [0, 1). Some parts of a round use a named stream instead,
`${clientSeed}:${nonce}:${name}:${cursor}`. Crash rounds use one seed per round:
`HMAC_SHA256(serverSeed, "crash:" + round)`.

How each game turns those numbers into its result is written out in `fairness.mjs`
(`FAIR_GAMES`) and on the [Provably Fair page](https://onlinebet.game/help/provably-fair).

## Use it

You need [Node.js](https://nodejs.org) 18 or newer. Nothing to install.

```bash
git clone https://github.com/<your-account>/onlinebet-fairness-verifier.git
cd onlinebet-fairness-verifier

node verify.mjs list
node verify.mjs dice   --server <server seed> --client <client seed> --nonce 42
node verify.mjs plinko --server <seed> --client <seed> --nonce 7 --rows 16
node verify.mjs limbo  --server <seed> --client <seed> --nonce 3 --rtp 99
node verify.mjs crash  --server <round seed> --round 123456 --rtp 99
```

Add `--hash <server seed hash>` to check the seed matches the hash you were shown.

The seeds and nonce of every bet are on its bet slip on the site.

## License

MIT
