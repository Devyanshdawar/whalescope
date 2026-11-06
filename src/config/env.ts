/**
 * @fileoverview Isolated Environment & Indexer Configuration Module.
 * 
 * Centralizes all external API keys, RPC endpoints, Webhook listeners,
 * and rate-limiting constants for the Crypto Whale Watcher platform.
 * 
 * Strict Architectural Rule:
 * DO NOT hardcode private keys or sensitive credentials anywhere in operational logic.
 * All values are ingested from Vite environment variables (`import.meta.env`) with
 * fallback defaults for immediate zero-config developer preview.
 * 
 * @module config/env
 */

export interface IndexerConfig {
  /** Primary indexer provider selection */
  readonly provider: "moralis" | "alchemy" | "debank" | "simulation";
  /** Moralis Web3 Data API key (https://admin.moralis.io) */
  readonly moralisApiKey: string;
  /** Moralis Streams API Webhook Secret */
  readonly moralisStreamSecret: string;
  /** Alchemy API Key or App ID (https://dashboard.alchemy.com) */
  readonly alchemyApiKey: string;
  /** Alchemy WebSocket endpoint for pending / mined transactions */
  readonly alchemyWsEndpoint: string;
  /** DeBank Cloud Open API key (https://docs.open.debank.com) */
  readonly debankApiKey: string;
  /** Default EVM Chain ID (1 = Ethereum Mainnet, 8453 = Base, 42161 = Arbitrum) */
  readonly defaultChainId: number;
}

export interface PollingConfig {
  /** Polling interval for live transaction feed in milliseconds (default: 30s) */
  readonly liveFeedPollIntervalMs: number;
  /** Ledger data refresh interval in milliseconds (default: 60s) */
  readonly ledgerRefreshIntervalMs: number;
  /** Maximum consecutive retry attempts before activating circuit breaker */
  readonly maxRetries: number;
  /** Exponential backoff base factor in milliseconds */
  readonly backoffBaseMs: number;
  /** In-memory cache TTL for wallet balances and stats (default: 45s) */
  readonly cacheTtlMs: number;
}

export interface AlertWebhookConfig {
  /** Discord incoming webhook URL (e.g., https://discord.com/api/webhooks/...) */
  readonly discordWebhookUrl: string;
  /** Telegram Bot token (e.g., 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11) */
  readonly telegramBotToken: string;
  /** Telegram Target Chat ID / Channel ID */
  readonly telegramChatId: string;
  /** Minimum transfer value in USD to trigger automated outbound alerts */
  readonly minAlertThresholdUsd: number;
  /** Enable browser native push notifications */
  readonly enableBrowserNotifications: boolean;
  /** Enable subtle synthesized audio chime on incoming whale alert */
  readonly enableSoundAlerts: boolean;
}

export interface AppEnvConfig {
  readonly isProduction: boolean;
  readonly indexer: IndexerConfig;
  readonly polling: PollingConfig;
  readonly alerts: AlertWebhookConfig;
}

/**
 * Helper to safely extract string environment variables across Vite / Browser / Node runtimes.
 * @param {string} key - Environment variable key name.
 * @param {string} defaultValue - Fallback value if variable is missing or empty.
 * @returns {string} Resolved environment variable.
 */
function getEnvString(key: string, defaultValue: string = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]);
  }
  return defaultValue;
}

/**
 * Helper to safely extract numeric environment variables.
 * @param {string} key - Environment variable key name.
 * @param {number} defaultValue - Fallback numeric value.
 * @returns {number} Resolved number.
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const val = getEnvString(key);
  const parsed = Number(val);
  return !isNaN(parsed) && val.trim() !== "" ? parsed : defaultValue;
}

/**
 * Helper to safely extract boolean environment variables.
 * @param {string} key - Environment variable key name.
 * @param {boolean} defaultValue - Fallback boolean value.
 * @returns {boolean} Resolved boolean.
 */
function getEnvBool(key: string, defaultValue: boolean): boolean {
  const val = getEnvString(key);
  if (val.toLowerCase() === "true" || val === "1") return true;
  if (val.toLowerCase() === "false" || val === "0") return false;
  return defaultValue;
}

/**
 * Immutable, frozen configuration singleton for the application.
 */
export const ENV: AppEnvConfig = Object.freeze({
  isProduction: getEnvString("MODE") === "production",

  indexer: Object.freeze({
    provider: (getEnvString("VITE_INDEXER_PROVIDER", "simulation").toLowerCase() as
      | "moralis"
      | "alchemy"
      | "debank"
      | "simulation"),
    moralisApiKey: getEnvString("VITE_MORALIS_API_KEY", ""),
    moralisStreamSecret: getEnvString("VITE_MORALIS_STREAM_SECRET", ""),
    alchemyApiKey: getEnvString("VITE_ALCHEMY_API_KEY", ""),
    alchemyWsEndpoint: getEnvString(
      "VITE_ALCHEMY_WS_URL",
      "wss://eth-mainnet.g.alchemy.com/v2/"
    ),
    debankApiKey: getEnvString("VITE_DEBANK_API_KEY", ""),
    defaultChainId: getEnvNumber("VITE_DEFAULT_CHAIN_ID", 1),
  }),

  polling: Object.freeze({
    liveFeedPollIntervalMs: getEnvNumber("VITE_POLL_INTERVAL_MS", 30000),
    ledgerRefreshIntervalMs: getEnvNumber("VITE_LEDGER_REFRESH_MS", 60000),
    maxRetries: getEnvNumber("VITE_MAX_RETRIES", 4),
    backoffBaseMs: getEnvNumber("VITE_BACKOFF_BASE_MS", 1500),
    cacheTtlMs: getEnvNumber("VITE_CACHE_TTL_MS", 45000),
  }),

  alerts: Object.freeze({
    discordWebhookUrl: getEnvString("VITE_DISCORD_WEBHOOK_URL", ""),
    telegramBotToken: getEnvString("VITE_TELEGRAM_BOT_TOKEN", ""),
    telegramChatId: getEnvString("VITE_TELEGRAM_CHAT_ID", ""),
    minAlertThresholdUsd: getEnvNumber("VITE_MIN_ALERT_THRESHOLD_USD", 500000),
    enableBrowserNotifications: getEnvBool("VITE_ENABLE_BROWSER_NOTIFICATIONS", true),
    enableSoundAlerts: getEnvBool("VITE_ENABLE_SOUND_ALERTS", true),
  }),
});

