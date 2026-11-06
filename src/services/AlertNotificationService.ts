/**
 * @fileoverview Alert & Notification Service.
 * 
 * Manages user-tracked wallets in persistent browser storage, handles native Web
 * Notifications, executes Web Audio API sound alerts, and asynchronously dispatches
 * Discord / Telegram webhook payloads when high-conviction whale transactions occur.
 * 
 * @module services/AlertNotificationService
 */

import { ENV } from "../config/env";
import type {
  SmartWallet,
  WebhookSettings,
  WhaleNotification,
  WhaleTransaction,
} from "../types/whaleWatcher";
import { logger } from "../utils/logger";

const STORAGE_KEYS = {
  TRACKED_WALLETS: "whalescope_tracked_wallets_v1",
  CUSTOM_WALLETS: "whalescope_custom_wallets_v1",
  SETTINGS: "whalescope_alert_settings_v1",
  NOTIFICATIONS: "whalescope_notifications_cache_v1",
} as const;

/**
 * Service class handling alert dispatches, persistence, and external webhook integrations.
 */
class AlertNotificationService {
  private trackedAddresses: Set<string>;
  private customWallets: Map<string, SmartWallet>;
  private settings: WebhookSettings;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.trackedAddresses = this.loadTrackedAddresses();
    this.customWallets = this.loadCustomWallets();
    this.settings = this.loadSettings();
  }

  /**
   * Initializes local storage cache or returns defaults.
   * @private
   * @returns {Set<string>} Set of lowercase wallet addresses.
   */
  private loadTrackedAddresses(): Set<string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACKED_WALLETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map((a) => String(a).toLowerCase()));
        }
      }
    } catch (err) {
      logger.warn("AlertService", "Could not parse tracked wallets from storage", err);
    }
    // Default initial tracked wallets
    return new Set([
      "0x71c8f4a296e37b1234f89d5123a7c921".toLowerCase(),
      "0x9f47a62db823f5983512b4aa0679e815".toLowerCase(),
      "0xe9174a62d028c18bff61d76074a80513".toLowerCase(),
    ]);
  }

  /**
   * Persists current tracked address set to browser storage.
   * @private
   */
  private persistTrackedAddresses(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRACKED_WALLETS,
        JSON.stringify(Array.from(this.trackedAddresses))
      );
    } catch (err) {
      logger.error("AlertService", "Failed to persist tracked wallets", err);
    }
  }

  /**
   * Loads custom user-created wallets from storage.
   * @private
   */
  private loadCustomWallets(): Map<string, SmartWallet> {
    const map = new Map<string, SmartWallet>();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_WALLETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((w: SmartWallet) => {
            if (w && w.address) {
              map.set(w.address.toLowerCase(), w);
            }
          });
        }
      }
    } catch (err) {
      logger.warn("AlertService", "Could not parse custom wallets from storage", err);
    }
    return map;
  }

  /**
   * Persists custom user wallets.
   * @private
   */
  private persistCustomWallets(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_WALLETS,
        JSON.stringify(Array.from(this.customWallets.values()))
      );
    } catch (err) {
      logger.error("AlertService", "Failed to persist custom wallets", err);
    }
  }

  /**
   * Loads user settings with fallback to environment constants.
   * @private
   */
  private loadSettings(): WebhookSettings {
    const defaults: WebhookSettings = {
      discordWebhookUrl: ENV.alerts.discordWebhookUrl,
      telegramBotToken: ENV.alerts.telegramBotToken,
      telegramChatId: ENV.alerts.telegramChatId,
      minAlertThresholdUsd: ENV.alerts.minAlertThresholdUsd,
      browserNotificationsEnabled: ENV.alerts.enableBrowserNotifications,
      soundEnabled: ENV.alerts.enableSoundAlerts,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch (err) {
      logger.warn("AlertService", "Could not parse settings from storage", err);
    }
    return defaults;
  }

  /**
   * Persists updated alert settings.
   * @param {Partial<WebhookSettings>} newSettings - Updated settings subset.
   */
  public updateSettings(newSettings: Partial<WebhookSettings>): WebhookSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (err) {
      logger.error("AlertService", "Failed to persist settings", err);
    }
    return this.settings;
  }

  /**
   * Retrieves current webhook and alert settings.
   * @returns {WebhookSettings} Current settings object.
   */
  public getSettings(): WebhookSettings {
    return { ...this.settings };
  }

  /**
   * Checks whether a specific wallet address is currently flagged for tracking.
   * @param {string} address - Ethereum or Solana address.
   * @returns {boolean} True if wallet is actively tracked.
   */
  public isWalletTracked(address: string): boolean {
    if (!address) return false;
    return this.trackedAddresses.has(address.toLowerCase());
  }

  /**
   * Toggles tracking state for a wallet address.
   * @param {string} address - Wallet address to toggle.
   * @returns {boolean} New tracked state (true = now tracked, false = untracked).
   */
  public toggleTrackWallet(address: string): boolean {
    if (!address) return false;
    const lower = address.toLowerCase();
    let isNowTracked = false;

    if (this.trackedAddresses.has(lower)) {
      this.trackedAddresses.delete(lower);
      isNowTracked = false;
    } else {
      this.trackedAddresses.add(lower);
      isNowTracked = true;
      // Proactively request browser notification permission if enabling tracking
      this.requestBrowserNotificationPermission();
      // Play a short confirmation chime
      if (this.settings.soundEnabled) {
        this.playAudioChime(660, 0.1);
      }
    }

    this.persistTrackedAddresses();
    return isNowTracked;
  }

  /**
   * Adds a brand new custom wallet to the tracking ledger.
   * @param {SmartWallet} wallet - Wallet data structure.
   */
  public addCustomWallet(wallet: SmartWallet): void {
    const lower = wallet.address.toLowerCase();
    this.customWallets.set(lower, { ...wallet, tracked: true });
    this.trackedAddresses.add(lower);
    this.persistCustomWallets();
    this.persistTrackedAddresses();
  }

  /**
   * Retrieves all custom user wallets.
   * @returns {SmartWallet[]} Array of custom wallets.
   */
  public getCustomWallets(): SmartWallet[] {
    return Array.from(this.customWallets.values());
  }

  /**
   * Retrieves array of all tracked addresses.
   * @returns {string[]} List of tracked addresses.
   */
  public getTrackedAddresses(): string[] {
    return Array.from(this.trackedAddresses);
  }

  /**
   * Prompts user for browser notification permission.
   * @returns {Promise<NotificationPermission>} Current permission string.
   */
  public async requestBrowserNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    if (Notification.permission === "default") {
      try {
        return await Notification.requestPermission();
      } catch (err) {
        logger.warn("AlertService", "Notification permission request error", err);
      }
    }
    return Notification.permission;
  }

  /**
   * Synthesizes an institutional two-tone alert chime using Web Audio API.
   * Zero external MP3/WAV dependencies.
   * @param {number} [freq=880] - Base frequency in Hz.
   * @param {number} [duration=0.15] - Tone duration in seconds.
   */
  public playAudioChime(freq: number = 880, duration: number = 0.15): void {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Graceful high-tech two-tone pitch bend
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.12);
    } catch {
      // Audio autoplay policy may suppress without user interaction; silently ignore
    }
  }

  /**
   * Dispatches a webhook payload to a Discord channel via standard Incoming Webhooks.
   * @param {WhaleTransaction} tx - Whale transaction details.
   * @param {string} alias - Human readable wallet name.
   */
  public async dispatchDiscordWebhook(tx: WhaleTransaction, alias?: string): Promise<boolean> {
    const url = this.settings.discordWebhookUrl.trim();
    if (!url || !url.startsWith("https://discord.com/api/webhooks")) {
      return false;
    }

    try {
      const embedPayload = {
        username: "WhaleScope Onchain Sentinel",
        avatar_url: "https://raw.githubusercontent.com/ethereum/brand-assets/master/ethereum-logo/ethereum-logo-portrait-black.png",
        embeds: [
          {
            title: `🚨 Whale Movement Detected: ${alias || tx.wallet}`,
            description: `**Action:** ${tx.action}\n**Value:** ${tx.value} USD\n**Chain:** ${tx.chain}`,
            color: 0x06b6d4, // Cyan hex color
            fields: [
              { name: "Wallet Address", value: `\`${tx.fromAddress}\``, inline: true },
              { name: "Token", value: `${tx.tokenAmount.toLocaleString()} ${tx.tokenSymbol}`, inline: true },
              { name: "Tx Hash", value: `[View on Etherscan](https://etherscan.io/tx/${tx.hash})`, inline: false },
            ],
            footer: {
              text: `WhaleScope Intelligence · Block ${tx.blockNumber || "Pending"}`,
            },
            timestamp: new Date(tx.timestamp).toISOString(),
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload),
      });

      return res.ok;
    } catch (err) {
      logger.warn("AlertService", "Discord webhook delivery failed", err);
      return false;
    }
  }

  /**
   * Dispatches an alert message to a Telegram Bot chat.
   * @param {WhaleTransaction} tx - Whale transaction details.
   * @param {string} alias - Human readable wallet name.
   */
  public async dispatchTelegramWebhook(tx: WhaleTransaction, alias?: string): Promise<boolean> {
    const botToken = this.settings.telegramBotToken.trim();
    const chatId = this.settings.telegramChatId.trim();

    if (!botToken || !chatId) {
      return false;
    }

    try {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const text =
        `🚨 *Whale Movement Detected*\n\n` +
        `*Entity:* ${alias || tx.wallet}\n` +
        `*Action:* ${tx.action}\n` +
        `*Value:* ${tx.value} (${tx.tokenAmount.toLocaleString()} ${tx.tokenSymbol})\n` +
        `*Chain:* ${tx.chain}\n` +
        `*Address:* \`${tx.fromAddress}\`\n\n` +
        `[View on Explorer](https://etherscan.io/tx/${tx.hash})`;

      const res = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      });

      return res.ok;
    } catch (err) {
      logger.warn("AlertService", "Telegram alert delivery failed", err);
      return false;
    }
  }

  /**
   * Evaluates an incoming transaction against tracked addresses and thresholds,
   * firing browser notifications, audio chimes, and external webhooks.
   * 
   * @param {WhaleTransaction} tx - Incoming transaction.
   * @param {string} [alias] - Optional known wallet label.
   * @returns {WhaleNotification | null} Created in-app notification or null if below threshold.
   */
  public processIncomingTransaction(
    tx: WhaleTransaction,
    alias?: string
  ): WhaleNotification | null {
    const isFromTracked = this.isWalletTracked(tx.fromAddress);
    const isToTracked = this.isWalletTracked(tx.toAddress);
    const isExplicitlyTracked = isFromTracked || isToTracked;
    const isHighValue = tx.valueUsd >= this.settings.minAlertThresholdUsd;

    // Only alert if wallet is explicitly tracked OR value breaches major whale threshold
    if (!isExplicitlyTracked && !isHighValue) {
      return null;
    }

    const title = isExplicitlyTracked
      ? `Tracked Whale Alert: ${alias || tx.wallet}`
      : `High-Value Whale ${tx.txType}: ${tx.tokenSymbol}`;

    const text = `${alias || tx.wallet} ${tx.action} on ${tx.chain}`;
    const color: WhaleNotification["color"] =
      tx.txType === "BUY" || tx.txType === "ACCUMULATION"
        ? "green"
        : tx.txType === "SELL"
        ? "rose"
        : isExplicitlyTracked
        ? "cyan"
        : "blue";

    const notification: WhaleNotification = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      text,
      value: tx.value,
      time: "Just now",
      color,
      timestamp: tx.timestamp,
      walletAddress: tx.fromAddress,
      txHash: tx.hash,
      read: false,
    };

    // 1. Play Audio Chime if enabled
    if (this.settings.soundEnabled) {
      this.playAudioChime(isExplicitlyTracked ? 980 : 750, 0.18);
    }

    // 2. Trigger native OS / Browser notification
    if (
      this.settings.browserNotificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(title, {
          body: `${text} (${tx.value})`,
          icon: "/favicon.ico",
          tag: tx.hash,
        });
      } catch (err) {
        logger.warn("AlertService", "Browser notification display failed", err);
      }
    }

    // 3. Dispatch Webhooks asynchronously (Non-blocking)
    if (this.settings.discordWebhookUrl) {
      this.dispatchDiscordWebhook(tx, alias);
    }
    if (this.settings.telegramBotToken && this.settings.telegramChatId) {
      this.dispatchTelegramWebhook(tx, alias);
    }

    return notification;
  }
}

/**
 * Singleton instance export for centralized alert operations.
 */
export const alertService = new AlertNotificationService();

