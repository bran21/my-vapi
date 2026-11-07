# vAPI Airdrop & Task Intelligence x402 API

Serverless x402 API endpoint built for **vAPI Network** and ready to deploy on **Vercel**.

## 🌟 Features

- **x402 Protocol Compliant:** Seamless micropayments via USDC on Base (`eip155:8453`).
- **Real-Time Airdrops & Tasks:** Returns live active campaigns and eligibility requirements.
- **Vercel Serverless Ready:** Deploy in seconds with zero infrastructure configuration.
- **AI Task Finder CLI Included:** Run `node airdrop-finder.mjs` locally with vAPI Router AI.

---

## 🚀 Endpoints

### `GET /api/airdrops` (or `/v1/airdrops`)

- **Without Payment:** Returns `HTTP 402 Payment Required` with the x402 payment contract.
- **Price:** `0.01 USDC` on Base.
- **Payee:** `0x22c90e068ab8a1cb07eb57c7efb439e768996654`.

---

## 🛠 Local CLI Tool

```bash
node airdrop-finder.mjs
node airdrop-finder.mjs --limit 3 --ai
node airdrop-finder.mjs --protocols
```

---

## 🌐 Deploy to Vercel

```bash
vercel
```

After deploying, register your URL on [vAPI Call](https://api.vapinetwork.ai/call/my-apis/new).
