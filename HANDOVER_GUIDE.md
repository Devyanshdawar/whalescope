# Crypto Whale Watcher - Developer & Buyer Handover Guide

Welcome to the **WhaleScope / Crypto Whale Watcher** commercial software asset. This application has been architected as an institutional-grade, production-ready full-stack software asset featuring both a dedicated **Node.js Web3 Backend Server** (`server.js`) and a reactive React 19 frontend UI.

---

## 0. Quick Start & Localhost Server (Node.js Backend)

The project ships with a zero-dependency, production-grade Node.js backend server in [`server.js`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/server.js).

### Launching the Backend Server:
```bash
# Start the full-stack backend & static server (runs on standard Node.js v18+)
node server.js

# Or via npm script:
npm start
```

### Localhost Access:
- **Local Dashboard & Backend URL:** **`http://localhost:8080`** (or `http://localhost:8443` in Figma Make)
- **Live REST API Endpoints:**
  - `GET  /api/health` — System diagnostics, RPC latency, and node health
  - `GET  /api/wallets` — Smart money ledger with live onchain balances and 24h P&L
  - `GET  /api/transactions` — Mempool whale transactions buffer (>= 10 ETH transfers)
  - `GET  /api/price/eth` — Live CoinGecko ETH price with server-side caching
  - `POST /api/rpc` — CORS-free JSON-RPC proxy to high-availability public nodes
  - `POST /api/alerts/webhook` — Outbound Discord and Telegram webhook dispatcher
  - `POST /api/payment/simulate` — Stripe and Web3 Crypto payment simulation gateway

---

## 1. Monetization Architecture & Commercial Configuration

Monetization, tier limits, pricing amounts, and Stripe public keys are centralized at the top of [`src/config/commercialConfig.ts`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/src/config/commercialConfig.ts) within the `COMMERCIAL_SETTINGS` object:

```typescript
export const COMMERCIAL_SETTINGS = {
  // Master Demo Mode switch for buyers to review unrestricted features
  DEMO_MODE_ACTIVE: false, // or via VITE_DEMO_MODE=true in .env

  PRICING: {
    monthlyPriceUsd: 79,
    annualPriceUsd: 749,
    discountPercentAnnual: 21,
    currencySymbol: "$",
    tierName: "Alpha Sentinel Pro",
  },

  GATEWAYS: {
    stripePublishableKey: "pk_test_...", // Drop your live or test Stripe key here
    cryptoTreasuryAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    acceptedCryptoCurrencies: ["USDC (ERC-20)", "USDT (Base)", "ETH", "SOL"],
  },

  TIER_LIMITS: {
    FREE: {
      maxTrackedWallets: 2,
      allowedRanks: [4, 5, 6, 7, 8], // Ranks 1-3 locked for Free tier
      canAccessWebhooks: false,
      canExportCsv: false,
    },
    PREMIUM: {
      maxTrackedWallets: 9999,
      canAccessWebhooks: true,
      canExportCsv: true,
      canAccessInstitutionalDossier: true,
    },
  },
};
```

### Marketplace Buyer "Demo Mode"
Prospective buyers reviewing the app can instantly unlock all premium features without paying by either:
1. Clicking the **Demo Mode: [ON / OFF]** button in the **System Health Status Bar** at the bottom footer.
2. Setting `VITE_DEMO_MODE=true` in `.env`.
3. Toggling **Tier: Free / Premium** with 1 click directly in the footer status bar to test how the paywall intercepts Free users.

---

## 2. Quick Start & Plugging In API Keys

All operational indexer settings are strictly isolated in [`src/config/env.ts`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/src/config/env.ts).

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Choose Your Indexer Provider
The application ships with a zero-downtime, high-fidelity **Simulation Adapter** enabled by default so you can test, demo, and pitch the product immediately without third-party billing accounts.

To connect live production blockchain data:

#### A. Alchemy Integration (Recommended for Real-Time Mempool & WebSockets)
1. Sign up at [Alchemy](https://dashboard.alchemy.com/).
2. Create an App on Ethereum Mainnet (or Arbitrum / Base).
3. Update `.env`:
   ```env
   VITE_INDEXER_PROVIDER=alchemy
   VITE_DEFAULT_CHAIN_ID=1
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
   VITE_ALCHEMY_WS_URL=wss://eth-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
   ```

#### B. Moralis Streams Integration (Recommended for Multi-Chain & Token Balances)
1. Sign up at [Moralis Web3](https://admin.moralis.io/).
2. Generate an API Key under **Settings > API Keys**.
3. Update `.env`:
   ```env
   VITE_INDEXER_PROVIDER=moralis
   VITE_MORALIS_API_KEY=your_moralis_api_key_here
   VITE_MORALIS_STREAM_SECRET=your_moralis_stream_secret_here
   ```

#### C. DeBank Cloud Open API
1. Register at [DeBank Cloud](https://docs.open.debank.com/).
2. Update `.env`:
   ```env
   VITE_INDEXER_PROVIDER=debank
   VITE_DEBANK_API_KEY=your_debank_api_key_here
   ```

---

## 3. Webhooks & Alert System Setup

The platform includes an automated multi-channel alert dispatcher supporting **Discord Incoming Webhooks**, **Telegram Bot Messages**, and native **HTML5 Web Push Notifications**.

### Discord Webhook Configuration
1. In Discord, go to **Server Settings > Integrations > Webhooks > New Webhook**.
2. Copy the Webhook URL.
3. Paste into `.env`:
   ```env
   VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_id/your_token
   VITE_MIN_ALERT_THRESHOLD_USD=500000
   ```
4. Alternatively, users can configure this directly inside the app via the **Alerts & Webhook Configuration** modal (click the Bell icon in the header).

### Telegram Bot Alerts
1. Create a bot using [@BotFather](https://t.me/BotFather) on Telegram and copy the API Token.
2. Obtain your target channel or user chat ID using [@userinfobot](https://t.me/userinfobot).
3. Set in `.env`:
   ```env
   VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   VITE_TELEGRAM_CHAT_ID=-100123456789
   ```

---

## 4. System Diagnostics & Health Status Bar

Located at the bottom footer of the application, the **SystemStatusBar** monitors:
- **CoinGecko API Health**: Probes response times and catches HTTP 429 rate limits, automatically toggling an amber badge with a helpful tooltip.
- **Ethereum RPC Node Latency**: Measures live round-trip time in milliseconds.
- **Storage Queue Count**: Tracks local browser memory allocations.
- **Mempool Velocity**: Reports transactions per minute.

---

## 5. Scaling from Local Storage to a Live Database Tier

Currently, user preferences, tracked wallet lists, custom labels, and notifications are managed client-side using `localStorage` via [`AlertNotificationService.ts`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/src/services/AlertNotificationService.ts) and [`AccessControlService.ts`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/src/services/AccessControlService.ts). This makes the client 100% serverless, zero-maintenance, and privacy-preserving.

When commercializing as a SaaS product with paid user accounts, follow this upgrade path:

### Step 1: Database Schema (PostgreSQL / Supabase)
```sql
-- User Subscription Profiles
CREATE TABLE user_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) DEFAULT 'Free', -- 'Free' | 'Premium'
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    renews_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Tracked Wallets Ledger
CREATE TABLE user_tracked_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(66) NOT NULL,
    entity_alias VARCHAR(100),
    primary_token VARCHAR(20) DEFAULT 'ETH',
    chain VARCHAR(30) DEFAULT 'Ethereum',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, wallet_address)
);

-- User Notification & Webhook Integrations
CREATE TABLE user_alert_configs (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_webhook_url TEXT,
    telegram_chat_id VARCHAR(64),
    min_threshold_usd NUMERIC DEFAULT 250000,
    browser_push_enabled BOOLEAN DEFAULT TRUE,
    sound_alerts_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: Swap Client-Side Storage for REST / GraphQL Endpoints
In [`src/services/AccessControlService.ts`](file:///Users/apple/Desktop/Build%20Whale%20Watcher%20Dashboard/src/services/AccessControlService.ts), replace `localStorage.getItem` and `localStorage.setItem` with authenticated API calls to your billing backend.

---

## 6. Hosting & Deployment Guide

This project compiles to static HTML/JS/CSS bundles that can be deployed anywhere with zero container overhead.

### A. Vercel Deployment (One-Click)
1. Push repository to GitHub or GitLab.
2. Import project into Vercel.
3. Set **Framework Preset** to `Vite`.
4. Under **Environment Variables**, add the keys from `.env.example`.
5. Deploy.

### B. Netlify Deployment
1. Connect repository in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in site configuration.

### C. Dockerized NGINX Production Container
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. Architectural Separation of Concerns

```
src/
├── config/
│   ├── commercialConfig.ts        # COMMERCIAL_SETTINGS, pricing, Stripe key placeholder, demo switch
│   └── env.ts                     # Strict environment isolation & typed configs
├── types/
│   └── whaleWatcher.ts            # Canonical data models & TypeScript interfaces
├── services/
│   ├── AccessControlService.ts    # User tiers ('Free' vs 'Premium'), gating checks, payment simulation
│   ├── SystemDiagnosticsService.ts# CoinGecko ping, RPC node latency, mempool throughput
│   ├── WhaleDataService.ts        # Indexer abstraction (Moralis, Alchemy, Simulation)
│   ├── TransactionStreamController.ts # WebSockets, auto-polling (30s), PubSub
│   └── AlertNotificationService.ts# Webhooks (Discord/Telegram), Web Audio, storage
├── context/
│   └── WhaleWatcherContext.tsx    # Reactive state provider and custom hook
├── components/
│   ├── layout/                    # Shell navigation, live marquee, sidebar
│   ├── dashboard/                 # Ledger table, system status bar, trending tokens, notification stream
│   ├── modals/                    # Add wallet, Alert settings, Tx inspector, Premium Paywall
│   └── ui/                        # Error Boundary, vector icons, primitives
└── App.tsx                        # Root layout orchestrator
```

---

## 8. Edge Case & Fault-Tolerance Handling

1. **Global React Error Boundary (`ErrorBoundary.tsx`)**: Protects the app from crashing due to unexpected onchain payload anomalies, offering a one-click "Reboot Engine" recovery.
2. **API Rate Limiting (HTTP 429)**: Handled via exponential backoff with random jitter in `WhaleDataService.ts` (`backoffBaseMs * 2^attempt + jitter`), while the `SystemStatusBar` signals the rate limit with an informative warning tooltip.
3. **Slow Network & Latency**: Full-row shimmering skeleton loaders (`WalletTableSkeleton.tsx`) prevent UI jumping and communicate background activity.
4. **Missing Blocks / Unconfirmed Txs**: Transactions gracefully display `Pending` or estimated block confirmations without null-pointer errors.
5. **Offline Mode**: Auto-reconnect with fallback to memory cache and local storage preserves uninterrupted dashboard operation.
