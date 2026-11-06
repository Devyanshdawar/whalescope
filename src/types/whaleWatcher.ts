/**
 * @fileoverview Type definitions for the Crypto Whale Watcher platform.
 * 
 * Defines rigorous data contracts for smart wallets, onchain whale transactions,
 * market analytics, alerts, and indexer state.
 * 
 * @module types/whaleWatcher
 */

export type BlockchainChain = "Ethereum" | "Solana" | "Base" | "Arbitrum" | "Polygon";

export type TransactionActionType = "SWAP" | "BUY" | "SELL" | "DEPOSIT" | "TRANSFER" | "ACCUMULATION";

/**
 * Represents a high-conviction Smart Money Wallet in the ledger.
 */
export interface SmartWallet {
  /** Numerical leaderboard rank */
  rank: number;
  /** Full 0x or Base58 public wallet address */
  address: string;
  /** Verified entity alias, ENS name, or institutional label */
  alias: string;
  /** 24-hour realized and unrealized Profit & Loss percentage */
  pnl: number;
  /** Historical 30-day win rate percentage (0 - 100) */
  winRate: number;
  /** Primary token asset ticker (e.g. "ETH", "SOL", "WBTC") */
  token: string;
  /** Hex color code for branding the primary asset */
  tokenColor: string;
  /** Whether the user has actively enabled alerts / tracking for this address */
  tracked: boolean;
  /** Total estimated portfolio value in USD */
  balanceUsd?: number;
  /** Primary blockchain ecosystem */
  chain?: BlockchainChain;
  /** ISO timestamp of latest detected on-chain activity */
  lastActive?: string;
  /** Calculated institutional conviction score (0 - 100) */
  convictionScore?: number;
}

/**
 * Represents an individual high-value onchain transfer or DEX swap.
 */
export interface WhaleTransaction {
  /** Unique transaction identifier or composite key */
  id: string;
  /** Onchain transaction hash (0x...) */
  hash: string;
  /** Origin wallet address */
  fromAddress: string;
  /** Destination wallet address or DEX router */
  toAddress: string;
  /** Display string for the wallet (e.g. "0x71C...A921" or "Jump Trading") */
  wallet: string;
  /** Human-readable action description (e.g. "swapped 500 ETH for USDC") */
  action: string;
  /** Categorized transaction type */
  txType: TransactionActionType;
  /** Primary token symbol involved */
  tokenSymbol: string;
  /** Approximate token quantity transacted */
  tokenAmount: number;
  /** Formatted USD valuation string (e.g. "$1.31M") */
  value: string;
  /** Exact numeric USD valuation */
  valueUsd: number;
  /** Relative time elapsed string (e.g. "2m ago", "Just now") */
  time: string;
  /** Precise UNIX epoch timestamp in milliseconds */
  timestamp: number;
  /** Blockchain chain origin */
  chain: BlockchainChain;
  /** Flag set to true if either sender or receiver is in the user's tracked queue */
  isTrackedWallet: boolean;
  /** Block number confirmation */
  blockNumber?: number;
}

/**
 * Trending token accumulated by smart money wallets.
 */
export interface TrendingToken {
  /** Token ticker symbol (e.g. "ETH") */
  symbol: string;
  /** Full token name (e.g. "Ethereum") */
  name: string;
  /** Current market price formatted as string (e.g. "$2,628.14") */
  price: string;
  /** 24-hour percentage change formatted string (e.g. "+8.4%") */
  change: string;
  /** Net capital inflow volume in 24 hours (e.g. "$42.8M") */
  flow: string;
  /** Branding color hex */
  color: string;
  /** Relative market share percentage index (0 - 100) */
  share: number;
}

/**
 * Live Alert and Notification event payload.
 */
export interface WhaleNotification {
  /** Unique notification ID */
  id: string | number;
  /** Headline title */
  title: string;
  /** Summary description of the detected movement */
  text: string;
  /** Formatted USD value or impact */
  value: string;
  /** Relative time description */
  time: string;
  /** Theme accent indicator color */
  color: "cyan" | "blue" | "green" | "rose" | "orange";
  /** Epoch timestamp in milliseconds */
  timestamp: number;
  /** Associated wallet address */
  walletAddress?: string;
  /** Associated transaction hash */
  txHash?: string;
  /** Notification read status */
  read?: boolean;
}

/**
 * Aggregated platform KPI stats for top metric cards.
 */
export interface MarketStats {
  /** Total value tracked across monitored wallets */
  totalValueTracked: string;
  totalValueDelta: string;
  /** Active smart money addresses currently online */
  activeWhalesOnline: string;
  activeWhalesDelta: string;
  /** 24-hour cumulative net capital flow */
  smartMoneyNetFlow: string;
  smartMoneyDelta: string;
  /** Last sync timestamp */
  lastSyncTime: string;
}

/**
 * Indexer health and connectivity status.
 */
export interface IndexerStatus {
  /** Active backend provider name */
  provider: "Moralis Streams" | "Alchemy Web3" | "DeBank Cloud" | "Simulated Live Feed";
  /** Connectivity state */
  isConnected: boolean;
  /** Latency in milliseconds */
  latencyMs: number;
  /** Last processed block height */
  blockHeight: number;
  /** ISO timestamp of latest sync */
  lastSyncTimestamp: number;
  /** Remaining rate limit credits if exposed */
  rateLimitRemaining?: number;
}

/**
 * User subscription access tier.
 */
export type UserTier = "Free" | "Premium";

/**
 * System Health & Network Node Diagnostics status.
 */
export interface SystemHealthDiagnostics {
  coingeckoStatus: "Connected" | "Rate-Limited" | "Degraded" | "Offline";
  coingeckoLatencyMs: number;
  rpcNodeStatus: "Connected" | "Degraded" | "Offline";
  rpcLatencyMs: number;
  activeTrackedWalletsCount: number;
  mempoolThroughputTpm: number;
  lastChecked: number;
  errorMessage: string | null;
}

/**
 * User-configurable webhook parameters.
 */
export interface WebhookSettings {
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  minAlertThresholdUsd: number;
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
}


