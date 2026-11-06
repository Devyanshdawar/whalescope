/**
 * @fileoverview Access Control & Premium Paywall Engine.
 * 
 * Manages user authorization tiers ('Free' vs 'Premium') in browser local storage,
 * enforces monetization gates across high-conviction alpha rows and webhooks,
 * and handles mock Stripe / Crypto payment simulations.
 * 
 * @module services/AccessControlService
 */

import { COMMERCIAL_SETTINGS } from "../config/commercialConfig";
import type { SmartWallet, UserTier } from "../types/whaleWatcher";
import { logger } from "../utils/logger";

const STORAGE_KEYS = {
  USER_TIER: "whalescope_user_tier_v1",
  DEMO_OVERRIDE: "whalescope_demo_override_v1",
} as const;

class AccessControlService {
  private currentTier: UserTier = "Free";
  private demoModeActive: boolean;

  constructor() {
    this.demoModeActive = this.loadDemoOverride();
    this.currentTier = this.loadUserTier();
  }

  /**
   * Loads initial tier from storage.
   * @private
   */
  private loadUserTier(): UserTier {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_TIER);
      if (stored === "Premium" || stored === "Free") {
        return stored;
      }
    } catch (err) {
      logger.warn("AccessControl", "Could not read tier from localStorage", err);
    }
    return "Free";
  }

  /**
   * Loads demo mode override state.
   * @private
   */
  private loadDemoOverride(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEMO_OVERRIDE);
      if (stored !== null) {
        return stored === "true";
      }
    } catch {
      // Ignore
    }
    return COMMERCIAL_SETTINGS.DEMO_MODE_ACTIVE;
  }

  /**
   * Returns current active tier. If demo mode is active, always returns 'Premium'.
   * @returns {UserTier} Current effective tier.
   */
  public getUserTier(): UserTier {
    if (this.demoModeActive) {
      return "Premium";
    }
    return this.currentTier;
  }

  /**
   * Whether the user currently has unrestricted Premium privileges.
   * @returns {boolean}
   */
  public isPremium(): boolean {
    return this.getUserTier() === "Premium";
  }

  /**
   * Sets user tier and persists to local storage.
   * @param {UserTier} tier
   */
  public setUserTier(tier: UserTier): void {
    this.currentTier = tier;
    try {
      localStorage.setItem(STORAGE_KEYS.USER_TIER, tier);
      logger.info("AccessControl", `User tier updated to ${tier}`);
    } catch (err) {
      logger.error("AccessControl", "Failed to persist user tier", err);
    }
  }

  /**
   * Toggles the marketplace buyer Demo Mode on or off.
   * @param {boolean} enabled
   */
  public setDemoMode(enabled: boolean): void {
    this.demoModeActive = enabled;
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_OVERRIDE, String(enabled));
      logger.info("AccessControl", `Demo Mode override set to ${enabled}`);
    } catch (err) {
      logger.error("AccessControl", "Failed to persist demo override", err);
    }
  }

  /**
   * Checks if Demo Mode is currently engaged.
   * @returns {boolean}
   */
  public isDemoMode(): boolean {
    return this.demoModeActive;
  }

  /**
   * Simulates a payment activation workflow (Stripe or Web3 Crypto).
   * Updates user tier to 'Premium' and logs transaction verification.
   * @param {"stripe" | "crypto"} method - Payment rails used.
   * @returns {Promise<boolean>}
   */
  public async simulatePaymentActivation(method: "stripe" | "crypto"): Promise<boolean> {
    logger.info("AccessControl", `Initiating ${method.toUpperCase()} payment simulation...`);

    // Simulate cryptographic or payment gateway network round-trip
    await new Promise((resolve) => setTimeout(resolve, 1100));

    this.setUserTier("Premium");
    logger.info("AccessControl", `Payment successful. Upgraded account to ${COMMERCIAL_SETTINGS.PRICING.tierName}`);
    return true;
  }

  /**
   * Resets tier back to Free for demonstration purposes.
   */
  public resetToFree(): void {
    this.setUserTier("Free");
    this.setDemoMode(false);
  }

  /**
   * Evaluates if a given smart wallet's deep alpha is gated behind the paywall.
   * Ranks 1-3 (Jump Trading, Wintermute, Amber Group) are institutional alpha reserved for Premium.
   * @param {SmartWallet} wallet
   * @returns {boolean} True if accessible, false if gated.
   */
  public canAccessWallet(wallet: SmartWallet): boolean {
    if (this.isPremium()) return true;
    return !COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.allowedRanks.length ||
      COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.allowedRanks.includes(wallet.rank);
  }

  /**
   * Evaluates whether the user can track an additional wallet.
   * Free tier is capped at 2 tracked addresses.
   * @param {number} currentTrackedCount
   * @returns {boolean}
   */
  public canTrackMoreWallets(currentTrackedCount: number): boolean {
    if (this.isPremium()) return true;
    return currentTrackedCount < COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.maxTrackedWallets;
  }

  /**
   * Checks whether the user is authorized to configure Discord/Telegram webhooks.
   * @returns {boolean}
   */
  public canAccessWebhooks(): boolean {
    if (this.isPremium()) return true;
    return COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.canAccessWebhooks;
  }

  /**
   * Checks whether CSV ledger export is authorized.
   * @returns {boolean}
   */
  public canExportCsv(): boolean {
    if (this.isPremium()) return true;
    return COMMERCIAL_SETTINGS.TIER_LIMITS.FREE.canExportCsv;
  }
}

export const accessControlService = new AccessControlService();

