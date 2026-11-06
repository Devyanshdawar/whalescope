# 🐋 WhaleScope Intelligence OS

> **Institutional-Grade Real-Time Crypto Whale Watcher, Mempool Stream Listener & Smart Money Analytics Platform.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Multi--Stage-2496ed?logo=docker)](Dockerfile)
[![Status](https://img.shields.io/badge/Production-Ready-emerald)](#)

---

## ⚡ Overview

**WhaleScope** is a high-performance Web3 software asset designed to track institutional smart money, monitor live onchain Ethereum mempool movements, identify high-conviction token accumulation, and dispatch real-time alerts to Telegram and Discord bots.

Built on an unbreakable **dual-layer architecture**:
1. **Dedicated Node.js Web3 Backend Engine** (`server.js`): Continuously polls public Ethereum RPC nodes, batches wallet balances, proxies JSON-RPC queries to bypass browser CORS blocks, and manages rate-limit caching for CoinGecko pricing.
2. **Reactive Frontend Dashboard**: Built with React 19, TypeScript 5.7, and Tailwind CSS v4, with an automated fallback to a zero-config standalone production distribution (`dist/index.html`).

---

## ✨ Core Features

### 📡 1. Real-Time Mempool Whale Ticker
- Automated background polling loop querying latest blocks every 15 seconds (`APP_CONFIG.POLLING_INTERVAL_MS`).
- Decodes raw transaction Wei into ETH decimals and filters large transfers $\ge 10\text{ ETH}$ (`APP_CONFIG.WHALE_THRESHOLD_ETH`).
- Feeds an infinite marquee ticker formatted cleanly as:
  ```
  [Shortened From Address] -> [Shortened To Address] ([Value] ETH)
  ```
- Maintains an array buffer cap of 10 items to protect client browser memory.

### 💼 2. Top 100 Smart Wallets Ledger
- Live onchain balances for verified institutional entities (*Jump Crypto, Binance Cold, Wintermute, Uniswap V3, Alpha Arbitrage*).
- Dynamic 24h P&L percentages, historical win-rate progress bars, conviction ratings (out of 100), and primary asset badges.
- Multi-column sorting (Rank, P&L, Win Rate), live text search, and 1-click **Institutional CSV Export**.

### 🔐 3. Commercial Paywall & Access Control Gateway
- Multi-tier permission model (`Free` vs `Premium`) managed persistently via browser `localStorage`.
- Intercepts Free tier clicks on restricted institutional wallets (Ranks 1–3) or webhook integrations, triggering the **"Unlock Real-Time Smart Money Alpha"** modal.
- Includes simulated **Stripe Card** and **Web3 Crypto Pay** (USDC/ETH) checkout pipelines with instant tier upgrades.
- **Buyer Demo Mode**: Master switch in the footer diagnostic bar allowing prospective marketplace buyers to toggle demo mode and unlock all premium features with one click.

### 🩺 4. System Health & Node Diagnostics Bar
- Real-time telemetry monitoring:
  - **CoinGecko Pricing API**: Status badge and response latency in ms with rate-limit warnings.
  - **Ethereum Public RPC Node**: Status badge and ping latency.
  - **Storage Queue**: Live count of wallets tracked in client memory.
  - **Mempool Throughput**: Transactions evaluated per minute.
  - **Buyer Controls**: 1-click switches for `Demo Mode: [ON / OFF]` and `Tier: [Free / Premium]`.

### 🔔 5. Multi-Channel Alert Dispatcher
- **Web Audio API**: Synthesized 880Hz alert chimes for instant onchain event audio feedback.
- **Outbound Webhooks**: Safe server-to-server dispatch (`POST /api/alerts/webhook`) for Discord Webhooks and Telegram Bot messages.
- **HTML5 Web Push**: Localized browser push notifications for tracked whale activity.

### ⌨️ 6. Command Palette (`⌘K`)
- Spotlight-style keyboard search overlay to explore wallets, verified entities, tokens, and recent high-conviction transactions instantly.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed on your machine.

### Option A: Run the Backend & Dashboard Server (Zero Dependencies Needed)
```bash
# Clone the repository
git clone https://github.com/Devyanshdawar/whalescope.git
cd whalescope

# Start the full-stack server
node server.js
# Or:
npm start
```
Open **`http://localhost:8080`** in your browser. The dashboard and all API endpoints are live immediately!

### Option B: Run in Vite Development Mode
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:8443`** (or port specified in `$PORT`).

---

## 🔌 REST API Reference

The backend exposes a full suite of CORS-free Web3 REST endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Real-time system health, RPC latency, uptime, and node diagnostics |
| `GET` | `/api/wallets` | Top smart wallets ledger with live onchain balances and 24h P&L |
| `GET` | `/api/transactions` | Latest mempool whale transfers buffer ($\ge 10\text{ ETH}$) |
| `GET` | `/api/price/eth` | Live CoinGecko Ethereum USD price with caching |
| `POST` | `/api/rpc` | High-speed JSON-RPC proxy to public nodes (eliminates browser CORS) |
| `POST` | `/api/wallets/track` | Adds or removes a wallet address from the active tracking queue |
| `POST` | `/api/alerts/webhook` | Dispatches alert payloads to Discord or Telegram webhooks |
| `POST` | `/api/payment/simulate` | Simulates Stripe or Crypto payment activation for Pro tiers |

---

## 🌐 Production Deployment

### 1. Render.com / Railway (1-Click Full-Stack)
- **Build Command:** *(leave blank)*
- **Start Command:** `node server.js`
- **Port:** `8080` (or leave default `$PORT`)

### 2. Vercel / Netlify (Static Edge)
- **Output Directory:** `dist`
- **Build Command:** *(leave blank if serving standalone `dist/index.html`, or `npm run build`)*

### 3. Docker & Docker Compose
```bash
# Build and run optimized container with NGINX edge caching
docker compose up -d --build
```
The application will be served on port `80` with automatic container health checks.

---

## 📁 Repository Structure

```
whalescope/
├── dist/                      # Standalone zero-config production client
│   └── index.html             # High-performance compiled dashboard
├── public/                    # Static image assets & favicons
├── src/                       # React 19 + TypeScript source application
│   ├── components/            # UI components (Ledger, Marquee, Modals, System Bar)
│   ├── config/                # Commercial settings, pricing, and environment
│   ├── context/               # Global state provider (WhaleWatcherContext)
│   ├── services/              # Web3 data service, stream controller, alerts, access control
│   ├── types/                 # TypeScript interfaces and data models
│   ├── utils/                 # Structured system logger
│   ├── App.tsx                # Primary application component
│   └── main.tsx               # React DOM entrypoint
├── Dockerfile                 # Multi-stage container build
├── docker-compose.yml         # Container orchestration configuration
├── nginx.conf                 # Edge NGINX reverse-proxy & gzip compression rules
├── server.js                  # Production Node.js Web3 backend engine
├── package.json               # Package configuration & scripts
└── HANDOVER_GUIDE.md          # Comprehensive commercial buyer blueprint
```

---

## ⚙️ Configuration & Environment

Configuration constants are isolated in [`src/config/env.ts`](src/config/env.ts) and [`src/config/commercialConfig.ts`](src/config/commercialConfig.ts).

Copy the environment template:
```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | Local web server port |
| `RPC_ENDPOINT` | `https://public-rpc.com` | High-availability Ethereum JSON-RPC node |
| `PRICE_API_ENDPOINT` | `https://api.coingecko.com/...` | CoinGecko Simple Price API |
| `WHALE_THRESHOLD_ETH` | `10` | Minimum transfer value in ETH to trigger alerts |
| `POLLING_INTERVAL_MS` | `15000` | Mempool query frequency in milliseconds |
| `DEMO_MODE` | `true` | Unlocks all Pro features for marketplace review |

---

## 📄 License & Commercial Acquisition

This project is commercially architected and turnkey-ready for software marketplaces (Acquire.com, Flippa, MicroAcquire) or private SaaS deployment.

Licensed under the **MIT License**. Copyright © 2025 Devyansh Dawar.
