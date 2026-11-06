/**
 * @fileoverview Main Whale Watcher Application Context & State Provider.
 * 
 * Centralizes reactive state for dynamic wallet ledgers, real-time transaction
 * feeds, alert notifications, commercial paywalls, system health telemetry,
 * and user configuration.
 * 
 * @module context/WhaleWatcherContext
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { COMMERCIAL_SETTINGS } from "../config/commercialConfig";
import { notificationData, trendingTokens as defaultTrending } from "../data/dashboardData";
import { accessControlService } from "../services/AccessControlService";
import { alertService } from "../services/AlertNotificationService";
import { systemDiagnosticsService } from "../services/SystemDiagnosticsService";
import { transactionStreamController } from "../services/TransactionStreamController";
import { whaleDataService } from "../services/WhaleDataService";
import type {
  IndexerStatus,
  MarketStats,
  SmartWallet,
  SystemHealthDiagnostics,
  TrendingToken,
  UserTier,
  WebhookSettings,
  WhaleNotification,
  WhaleTransaction,
} from "../types/whaleWatcher";
import { logger } from "../utils/logger";

interface WhaleWatcherContextValue {
  wallets: SmartWallet[];
  isLoadingWallets: boolean;
  walletError: string | null;
  refreshWallets: () => Promise<void>;
  toggleTrack: (address: string) => void;
  addCustomWallet: (data: {
    address: string;
    alias: string;
    token: string;
    chain?: SmartWallet["chain"];
  }) => boolean;
  transactions: WhaleTransaction[];
  notifications: WhaleNotification[];
  clearNotifications: () => void;
  trendingTokens: TrendingToken[];
  marketStats: MarketStats;
  indexerStatus: IndexerStatus;
  settings: WebhookSettings;
  updateSettings: (newSettings: Partial<WebhookSettings>) => void;
  selectedTransaction: WhaleTransaction | null;
  setSelectedTransaction: (tx: WhaleTransaction | null) => void;
  isAddWalletOpen: boolean;
  setIsAddWalletOpen: (open: boolean) => void;
  isAlertSettingsOpen: boolean;
  setIsAlertSettingsOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  lastSyncedAgo: string;

  // Commercial & Access Control Layer
  userTier: UserTier;
  isPremium: boolean;
  isDemoMode: boolean;
  setUserTier: (tier: UserTier) => void;
  toggleDemoMode: () => void;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  activatePremium: (method: "stripe" | "crypto") => Promise<boolean>;

  // System Health & Diagnostics
  systemHealth: SystemHealthDiagnostics;
  refreshDiagnostics: () => Promise<void>;
}

const WhaleWatcherContext = createContext<WhaleWatcherContextValue | null>(null);

const INITIAL_MARKET_STATS: MarketStats = {
  totalValueTracked: "$842.67M",
  totalValueDelta: "+12.4%",
  activeWhalesOnline: "1,284",
  activeWhalesDelta: "+8.7%",
  smartMoneyNetFlow: "+$38.42M",
  smartMoneyDelta: "+22.1%",
  lastSyncTime: "Synced Just now",
};

const INITIAL_INDEXER_STATUS: IndexerStatus = {
  provider: "Simulated Live Feed",
  isConnected: true,
  latencyMs: 14,
  blockHeight: 21124800,
  lastSyncTimestamp: Date.now(),
};

export function WhaleWatcherProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<SmartWallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState<boolean>(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [notifications, setNotifications] = useState<WhaleNotification[]>(() => {
    return notificationData.map((n) => ({
      id: String(n.id),
      title: n.title,
      text: n.text,
      value: n.value,
      time: n.time,
      color: (n.color as WhaleNotification["color"]) || "blue",
      timestamp: Date.now() - 60000,
      read: false,
    }));
  });

  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>(defaultTrending);
  const [marketStats, setMarketStats] = useState<MarketStats>(INITIAL_MARKET_STATS);
  const [indexerStatus, setIndexerStatus] = useState<IndexerStatus>(INITIAL_INDEXER_STATUS);
  const [settings, setSettings] = useState<WebhookSettings>(() => alertService.getSettings());

  const [selectedTransaction, setSelectedTransaction] = useState<WhaleTransaction | null>(null);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState<boolean>(false);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState<boolean>(false);

  // Commercial Access & Paywall State
  const [userTier, setUserTierState] = useState<UserTier>(() => accessControlService.getUserTier());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => accessControlService.isDemoMode());
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  // Diagnostics State
  const [systemHealth, setSystemHealth] = useState<SystemHealthDiagnostics>(() =>
    systemDiagnosticsService.getStatus()
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [lastSyncedAgo, setLastSyncedAgo] = useState<string>("Synced 4 sec ago");

  const isPremium = accessControlService.isPremium();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  const setUserTier = useCallback((tier: UserTier) => {
    accessControlService.setUserTier(tier);
    setUserTierState(tier);
  }, []);

  const toggleDemoMode = useCallback(() => {
    const next = !accessControlService.isDemoMode();
    accessControlService.setDemoMode(next);
    setIsDemoMode(next);
    setUserTierState(accessControlService.getUserTier());
    showToast(next ? "Demo Mode engaged: All Alpha Sentinel features unlocked!" : "Demo Mode disengaged.");
  }, [showToast]);

  const activatePremium = useCallback(async (method: "stripe" | "crypto") => {
    const ok = await accessControlService.simulatePaymentActivation(method);
    if (ok) {
      setUserTierState("Premium");
      return true;
    }
    return false;
  }, []);

  const refreshDiagnostics = useCallback(async () => {
    const status = await systemDiagnosticsService.checkHealth();
    setSystemHealth(status);
    showToast("Diagnostics telemetry re-pinged");
  }, [showToast]);

  const loadWallets = useCallback(
    async (forceRefresh = false) => {
      setIsLoadingWallets(true);
      setWalletError(null);
      try {
        const data = await whaleDataService.fetchSmartWallets(forceRefresh);
        setWallets(data);
        setLastSyncTime(Date.now());
      } catch (err) {
        logger.error("WhaleWatcherContext", "Failed to load wallets", err);
        setWalletError("Unable to reach blockchain indexer. Showing cached ledger.");
      } finally {
        setIsLoadingWallets(false);
      }
    },
    []
  );

  const refreshWallets = useCallback(async () => {
    await loadWallets(true);
    const updatedStats = await whaleDataService.fetchMarketStats();
    setMarketStats(updatedStats);
    const health = await whaleDataService.getIndexerStatus();
    setIndexerStatus(health);
    await refreshDiagnostics();
    showToast("Ledger synchronized with latest onchain blocks");
  }, [loadWallets, refreshDiagnostics, showToast]);

  /**
   * Toggles tracking state with Paywall Access Gate interception.
   */
  const toggleTrack = useCallback(
    (address: string) => {
      const target = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
      const isCurrentlyTracked = alertService.isWalletTracked(address);

      // If user is Free and trying to activate tracking:
      if (!accessControlService.isPremium() && !isCurrentlyTracked) {
        // 1. Check if wallet is a restricted institutional alpha rank (Ranks 1-3)
        if (target && !accessControlService.canAccessWallet(target)) {
          setIsPaywallOpen(true);
          showToast(`Rank #${target.rank} (${target.alias}) is reserved for Alpha Sentinel Pro.`);
          return;
        }

        // 2. Check tracking quota
        const currentCount = alertService.getTrackedAddresses().length;
        if (!accessControlService.canTrackMoreWallets(currentCount)) {
          setIsPaywallOpen(true);
          showToast(`Free tier limit (${COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.maxTrackedWallets} wallets) reached. Upgrade for unlimited tracking.`);
          return;
        }
      }

      const isNowTracked = alertService.toggleTrackWallet(address);

      setWallets((current) =>
        current.map((w) =>
          w.address.toLowerCase() === address.toLowerCase() ? { ...w, tracked: isNowTracked } : w
        )
      );

      setTransactions((current) =>
        current.map((tx) =>
          tx.fromAddress.toLowerCase() === address.toLowerCase() ||
          tx.toAddress.toLowerCase() === address.toLowerCase()
            ? { ...tx, isTrackedWallet: isNowTracked }
            : tx
        )
      );

      // Update diagnostics count
      setSystemHealth((prev) => ({
        ...prev,
        activeTrackedWalletsCount: alertService.getTrackedAddresses().length,
      }));

      const label = target?.alias || `${address.slice(0, 6)}...${address.slice(-4)}`;
      if (isNowTracked) {
        showToast(`Tracking enabled for ${label}. Active alerts engaged.`);
      } else {
        showToast(`Untracked ${label}. Alerts deactivated.`);
      }
    },
    [wallets, showToast]
  );

  const addCustomWallet = useCallback(
    (data: {
      address: string;
      alias: string;
      token: string;
      chain?: SmartWallet["chain"];
    }): boolean => {
      // Free quota check
      const currentCount = alertService.getTrackedAddresses().length;
      if (!accessControlService.isPremium() && !accessControlService.canTrackMoreWallets(currentCount)) {
        setIsPaywallOpen(true);
        showToast("Free tier tracking limit reached. Upgrade to Pro to track custom addresses.");
        return false;
      }

      const trimmed = data.address.trim();
      if (!trimmed || trimmed.length < 10) {
        showToast("Invalid wallet address provided.");
        return false;
      }

      const newWallet: SmartWallet = {
        rank: wallets.length + 1,
        address: trimmed,
        alias: data.alias.trim() || `Whale ${trimmed.slice(0, 6)}`,
        pnl: 12.4,
        winRate: 80.0,
        token: data.token.toUpperCase() || "ETH",
        tokenColor: data.token === "SOL" ? "#9945FF" : data.token === "WBTC" ? "#F7931A" : "#627EEA",
        tracked: true,
        chain: data.chain || "Ethereum",
        balanceUsd: 25000000,
        convictionScore: 85,
      };

      alertService.addCustomWallet(newWallet);
      setWallets((current) => [newWallet, ...current]);
      setSystemHealth((prev) => ({
        ...prev,
        activeTrackedWalletsCount: alertService.getTrackedAddresses().length,
      }));
      showToast(`Added ${newWallet.alias} to tracked ledger`);
      return true;
    },
    [wallets.length, showToast]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    showToast("Notification stream cleared");
  }, [showToast]);

  const updateSettings = useCallback(
    (newSettings: Partial<WebhookSettings>) => {
      const updated = alertService.updateSettings(newSettings);
      setSettings(updated);
      showToast("Alert and webhook settings updated");
    },
    [showToast]
  );

  useEffect(() => {
    let isMounted = true;
    loadWallets(false);

    whaleDataService.fetchRecentTransactions(8).then((initialTxs) => {
      if (isMounted) setTransactions(initialTxs);
    });

    whaleDataService.fetchMarketStats().then((stats) => {
      if (isMounted) setMarketStats(stats);
    });

    whaleDataService.getIndexerStatus().then((status) => {
      if (isMounted) setIndexerStatus(status);
    });

    // Start diagnostics subscriber
    const unsubscribeDiag = systemDiagnosticsService.subscribe((diag) => {
      if (isMounted) setSystemHealth(diag);
    });

    // Subscribe to live transactions
    const unsubscribeTx = transactionStreamController.subscribeToTransactions((newTx) => {
      if (!isMounted) return;
      setTransactions((current) => {
        const filtered = current.filter((t) => t.hash !== newTx.hash);
        return [newTx, ...filtered].slice(0, 14);
      });
      setLastSyncTime(Date.now());
    });

    // Subscribe to high-conviction alerts
    const unsubscribeAlert = transactionStreamController.subscribeToAlerts((newAlert) => {
      if (!isMounted) return;
      setNotifications((current) => [newAlert, ...current.slice(0, 19)]);
    });

    return () => {
      isMounted = false;
      unsubscribeDiag();
      unsubscribeTx();
      unsubscribeAlert();
    };
  }, [loadWallets]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const diffSec = Math.max(1, Math.floor((Date.now() - lastSyncTime) / 1000));
      if (diffSec < 60) {
        setLastSyncedAgo(`Synced ${diffSec}s ago`);
      } else {
        setLastSyncedAgo(`Synced ${Math.floor(diffSec / 60)}m ago`);
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [lastSyncTime]);

  const value: WhaleWatcherContextValue = {
    wallets,
    isLoadingWallets,
    walletError,
    refreshWallets,
    toggleTrack,
    addCustomWallet,
    transactions,
    notifications,
    clearNotifications,
    trendingTokens,
    marketStats,
    indexerStatus,
    settings,
    updateSettings,
    selectedTransaction,
    setSelectedTransaction,
    isAddWalletOpen,
    setIsAddWalletOpen,
    isAlertSettingsOpen,
    setIsAlertSettingsOpen,
    toastMessage,
    showToast,
    lastSyncedAgo,

    // Commercial Paywall & Tier Management
    userTier,
    isPremium,
    isDemoMode,
    setUserTier,
    toggleDemoMode,
    isPaywallOpen,
    setIsPaywallOpen,
    activatePremium,

    // System Diagnostics
    systemHealth,
    refreshDiagnostics,
  };

  return (
    <WhaleWatcherContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-12 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-[#101726]/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl shadow-blue-500/10 backdrop-blur-md transition-all">
          <span className="live-dot" />
          <span>{toastMessage}</span>
        </div>
      )}
    </WhaleWatcherContext.Provider>
  );
}

export function useWhaleWatcher(): WhaleWatcherContextValue {
  const context = useContext(WhaleWatcherContext);
  if (!context) {
    throw new Error("useWhaleWatcher must be used within a WhaleWatcherProvider");
  }
  return context;
}
