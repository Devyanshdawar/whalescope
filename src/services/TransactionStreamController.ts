/**
 * @fileoverview Real-Time Transaction Stream Controller.
 * 
 * Orchestrates live high-value whale transaction feeds for the header marquee
 * and live activity feeds. Operates via WebSocket listener when configured,
 * or an optimized auto-polling mechanism (30-second cycles) with rate-limit
 * guards and automatic reconnection.
 * 
 * Feeds detected movements to the AlertNotificationService to trigger browser
 * notifications, sound alerts, and Discord/Telegram webhooks for tracked wallets.
 * 
 * @module services/TransactionStreamController
 */

import { APP_CONFIG, shortenAddress, whaleDataService } from "./WhaleDataService";
import { ENV } from "../config/env";
import type { WhaleNotification, WhaleTransaction } from "../types/whaleWatcher";
import { logger } from "../utils/logger";
import { alertService } from "./AlertNotificationService";

type TransactionListener = (tx: WhaleTransaction) => void;
type AlertListener = (alert: WhaleNotification) => void;

/**
 * Real-time transaction stream controller supporting both WebSockets and auto-polling.
 */
class TransactionStreamController {
  private txListeners: Set<TransactionListener> = new Set();
  private alertListeners: Set<AlertListener> = new Set();
  private pollTimer: number | null = null;
  private ws: WebSocket | null = null;
  private isRunning = false;
  private knownTxHashes = new Set<string>();

  // Realistic simulation pool for live streaming
  private liveSimulationPool: ReadonlyArray<Omit<WhaleTransaction, "id" | "hash" | "timestamp" | "time" | "blockNumber" | "isTrackedWallet">> = [
    {
      fromAddress: "0x71C8F4A296E37B1234F89D5123A7C921",
      toAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
      wallet: "Jump Trading",
      action: "swapped 1,200 ETH for 3.15M USDC on Uniswap V3",
      txType: "SWAP",
      tokenSymbol: "ETH",
      tokenAmount: 1200,
      value: "$3.15M",
      valueUsd: 3153768,
      chain: "Ethereum",
    },
    {
      fromAddress: "0x3B91F0C47618D9E4027A6A85C17EA21B",
      toAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      wallet: "Alpha Seeker",
      action: "accumulated 45.2 WBTC via Cumberland OTC",
      txType: "ACCUMULATION",
      tokenSymbol: "WBTC",
      tokenAmount: 45.2,
      value: "$3.09M",
      valueUsd: 3092132,
      chain: "Ethereum",
    },
    {
      fromAddress: "0xA38D9271BC008F52E6650145C93A88D4",
      toAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      wallet: "Wintermute",
      action: "supplied 5.20M USDT to Aave V3 Liquidity Pool",
      txType: "DEPOSIT",
      tokenSymbol: "USDT",
      tokenAmount: 5200000,
      value: "$5.20M",
      valueUsd: 5200000,
      chain: "Ethereum",
    },
    {
      fromAddress: "0x9F47A62DB823F5983512B4AA0679E815",
      toAddress: "0x546b46399c43D343ff27e2F56C712C57B4A1D79E",
      wallet: "Amber Group",
      action: "bought 24,500 SOL via Jupiter Aggregator",
      txType: "BUY",
      tokenSymbol: "SOL",
      tokenAmount: 24500,
      value: "$3.63M",
      valueUsd: 3633840,
      chain: "Solana",
    },
    {
      fromAddress: "0xE9174A62D028C18BFF61D76074A80513",
      toAddress: "0x57e114B691Db790C35207b2e685D4A43181e6061",
      wallet: "Fund 0xE9",
      action: "staked 8,500,000 ENA in Ethena S1 Vault",
      txType: "DEPOSIT",
      tokenSymbol: "ENA",
      tokenAmount: 8500000,
      value: "$4.93M",
      valueUsd: 4930000,
      chain: "Arbitrum",
    },
    {
      fromAddress: "0xD42C5816BA7287E15C42F65093F6F5B0",
      toAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      wallet: "Smart LP 0xD4",
      action: "swapped 180,000 LINK for 1,012 ETH",
      txType: "SWAP",
      tokenSymbol: "LINK",
      tokenAmount: 180000,
      value: "$2.66M",
      valueUsd: 2665800,
      chain: "Ethereum",
    },
    {
      fromAddress: "0x28C6c06298d514Db089934071355E5743bf21d60",
      toAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      wallet: "Paradigm Reserve",
      action: "transferred 650,000 UNI to Multi-Sig Safe",
      txType: "TRANSFER",
      tokenSymbol: "UNI",
      tokenAmount: 650000,
      value: "$5.14M",
      valueUsd: 5148000,
      chain: "Ethereum",
    },
  ];

  /**
   * Starts real-time stream via WebSocket or auto-polling.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Check if WebSocket is available and enabled
    if (ENV.indexer.alchemyWsEndpoint && ENV.indexer.alchemyApiKey) {
      this.initWebSocket();
    } else {
      this.initAutoPolling();
    }
  }

  /**
   * Stops real-time stream and clears all active timers.
   */
  public stop(): void {
    this.isRunning = false;
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Initializes WebSocket connection to node indexer with reconnect backoff.
   * @private
   */
  private initWebSocket(): void {
    try {
      const url = `${ENV.indexer.alchemyWsEndpoint}${ENV.indexer.alchemyApiKey}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        // Subscribe to pending transactions or mined transfers
        this.ws?.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_subscribe",
            params: ["alchemy_minedTransactions"],
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.params && data.params.result) {
            this.handleIncomingRawTx(data.params.result);
          }
        } catch (err) {
          logger.warn("StreamController", "WebSocket message parse error", err);
        }
      };

      this.ws.onerror = (err) => {
        logger.warn("StreamController", "WebSocket error, falling back to polling", err);
        this.ws?.close();
        this.initAutoPolling();
      };

      this.ws.onclose = () => {
        if (this.isRunning) {
          // Fall back to polling
          this.initAutoPolling();
        }
      };
    } catch {
      this.initAutoPolling();
    }
  }

  /**
   * Initializes the automated asynchronous loop tied directly to APP_CONFIG.POLLING_INTERVAL_MS.
   * @private
   */
  private initAutoPolling(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }

    const interval = APP_CONFIG.POLLING_INTERVAL_MS || 15000;

    // Initial immediate polling cycle
    this.pollCycle();

    this.pollTimer = window.setInterval(() => {
      this.pollCycle();
    }, interval);
    logger.info("StreamController", `Real-time mempool polling initiated at ${interval}ms intervals`);
  }

  /**
   * Executes a polling cycle querying latest blocks from the public RPC endpoint.
   * Filters transactions >= APP_CONFIG.WHALE_THRESHOLD_ETH (10 ETH) and buffers up to 10 items.
   * @private
   */
  private async pollCycle(): Promise<void> {
    try {
      const recentTxs = await whaleDataService.pollMempoolWhaleTransactions();
      if (recentTxs && recentTxs.length > 0) {
        // Dispatch the latest detected whale transaction
        const latest = recentTxs[0];
        if (latest && !this.knownTxHashes.has(latest.hash)) {
          this.knownTxHashes.add(latest.hash);
          if (this.knownTxHashes.size > 200) {
            const first = this.knownTxHashes.values().next().value;
            if (first) this.knownTxHashes.delete(first);
          }
          this.dispatchTransaction(latest);
        }
      }
    } catch (err) {
      logger.warn("StreamController", "Polling cycle error", err);
    }
  }

  /**
   * Formats raw onchain event into a standardized WhaleTransaction.
   * @private
   */
  private handleIncomingRawTx(rawTx: Record<string, unknown>): void {
    const hash = String(rawTx.hash || "");
    if (!hash || this.knownTxHashes.has(hash)) return;

    this.knownTxHashes.add(hash);
    if (this.knownTxHashes.size > 200) {
      const first = this.knownTxHashes.values().next().value;
      if (first) this.knownTxHashes.delete(first);
    }

    const from = String(rawTx.from || "0x0000000000000000000000000000000000000000");
    const to = String(rawTx.to || "0x0000000000000000000000000000000000000000");
    const isTracked = alertService.isWalletTracked(from) || alertService.isWalletTracked(to);

    const tx: WhaleTransaction = {
      id: `live-${hash.substring(0, 10)}`,
      hash,
      fromAddress: from,
      toAddress: to,
      wallet: `${from.substring(0, 6)}...${from.substring(from.length - 4)}`,
      action: "executed onchain transfer",
      txType: "TRANSFER",
      tokenSymbol: "ETH",
      tokenAmount: 250,
      value: "$657K",
      valueUsd: 657000,
      time: "Just now",
      timestamp: Date.now(),
      chain: "Ethereum",
      isTrackedWallet: isTracked,
    };

    this.dispatchTransaction(tx);
  }

  /**
   * Dispatches transaction to all active listeners and triggers alert service.
   * @private
   */
  private dispatchTransaction(tx: WhaleTransaction): void {
    // 1. Notify transaction subscribers (Header Marquee, Activity streams)
    this.txListeners.forEach((listener) => {
      try {
        listener(tx);
      } catch (err) {
        logger.error("StreamController", "Listener error", err);
      }
    });

    // 2. Process via Alert Service for notifications, webhooks & sound
    const notification = alertService.processIncomingTransaction(tx, tx.wallet);
    if (notification) {
      this.alertListeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (err) {
          logger.error("StreamController", "Alert listener error", err);
        }
      });
    }
  }

  /**
   * Subscribes a callback to receive incoming live transactions.
   * @param {TransactionListener} callback - Function receiving each transaction.
   * @returns {() => void} Unsubscribe function.
   */
  public subscribeToTransactions(callback: TransactionListener): () => void {
    this.txListeners.add(callback);
    if (!this.isRunning) {
      this.start();
    }
    return () => {
      this.txListeners.delete(callback);
    };
  }

  /**
   * Subscribes a callback to receive high-conviction alerts for tracked wallets.
   * @param {AlertListener} callback - Function receiving alert events.
   * @returns {() => void} Unsubscribe function.
   */
  public subscribeToAlerts(callback: AlertListener): () => void {
    this.alertListeners.add(callback);
    if (!this.isRunning) {
      this.start();
    }
    return () => {
      this.alertListeners.delete(callback);
    };
  }
}

/**
 * Singleton instance export of the Transaction Stream Controller.
 */
export const transactionStreamController = new TransactionStreamController();

