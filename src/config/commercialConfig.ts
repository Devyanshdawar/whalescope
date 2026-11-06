/**
 * @fileoverview Central Administrative & Commercialization Configuration (`COMMERCIAL_SETTINGS`).
 * 
 * Group all administrative monetization parameters, Stripe gateway credentials,
 * tier limitations, and marketplace buyer demo controls here at the absolute top.
 * 
 * Prospective buyers can adjust pricing tiers, plug in live Stripe keys,
 * or toggle DEMO_MODE to immediately showcase all restricted features.
 * 
 * @module config/commercialConfig
 */

export interface CommercialConfig {
  /** Master demo switch for prospective marketplace buyers. When true, unlocks all tier restrictions */
  readonly DEMO_MODE_ACTIVE: boolean;

  /** Platform product branding and acquisition metadata */
  readonly ASSET_INFO: {
    readonly productName: string;
    readonly releaseVersion: string;
    readonly architecture: string;
    readonly licenseType: string;
  };

  /** Premium Subscription Pricing and Details */
  readonly PRICING: {
    readonly monthlyPriceUsd: number;
    readonly annualPriceUsd: number;
    readonly discountPercentAnnual: number;
    readonly currencySymbol: string;
    readonly tierName: string;
  };

  /** Payment Gateway Integration Keys (Stripe & Direct Crypto Pay) */
  readonly GATEWAYS: {
    /** Stripe Publishable Key Placeholder: pk_live_... or pk_test_... */
    readonly stripePublishableKey: string;
    /** Direct Crypto Treasury Address for Web3 Payments (USDC / USDT / ETH) */
    readonly cryptoTreasuryAddress: string;
    readonly acceptedCryptoCurrencies: ReadonlyArray<string>;
  };

  /** Feature Limits by User Access Tier */
  readonly TIER_LIMITS: {
    readonly FREE: {
      readonly maxTrackedWallets: number;
      readonly allowedRanks: ReadonlyArray<number>; // e.g. Ranks 1-3 locked for Free
      readonly canAccessWebhooks: boolean;
      readonly canExportCsv: boolean;
      readonly canAccessAudioChimes: boolean;
      readonly minAlertThresholdUsd: number;
    };
    readonly PREMIUM: {
      readonly maxTrackedWallets: number;
      readonly canAccessWebhooks: boolean;
      readonly canExportCsv: boolean;
      readonly canAccessAudioChimes: boolean;
      readonly canAccessInstitutionalDossier: boolean;
    };
  };

  /** CoinGecko & Node Diagnostics Endpoints */
  readonly DIAGNOSTICS: {
    readonly coingeckoPingUrl: string;
    readonly publicRpcPingUrl: string;
    readonly healthCheckIntervalMs: number;
  };
}

/**
 * Immutable administrative monetization configuration.
 * Configured at build time or via environment variables with zero code changes required.
 */
export const COMMERCIAL_SETTINGS: CommercialConfig = Object.freeze({
  // Master Demo Mode switch set to TRUE so prospective marketplace buyers can test premium features instantly
  DEMO_MODE_ACTIVE:
    typeof import.meta !== "undefined" && import.meta.env?.VITE_DEMO_MODE === "false" ? false : true,

  ASSET_INFO: Object.freeze({
    productName: "WhaleScope Intelligence OS",
    releaseVersion: "v2.5.0-Commercial",
    architecture: "React 19 + TypeScript 5.7 + Tailwind v4 + Onchain Streams Engine",
    licenseType: "Commercial Proprietary - Full Acquisition Asset",
  }),

  PRICING: Object.freeze({
    monthlyPriceUsd: 49,
    annualPriceUsd: 470,
    discountPercentAnnual: 20,
    currencySymbol: "$",
    tierName: "Alpha Sentinel Pro",
  }),

  GATEWAYS: Object.freeze({
    // Buyer can drop their Stripe Publishable Key directly here
    stripePublishableKey:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PUBLIC_KEY) ||
      "pk_test_51MzWhaleWatcherMockStripeKey9900AlphaDevProdAsset0000",
    cryptoTreasuryAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    acceptedCryptoCurrencies: Object.freeze(["USDC (ERC-20)", "USDT (Base)", "ETH", "SOL"]),
  }),

  TIER_LIMITS: Object.freeze({
    FREE: Object.freeze({
      maxTrackedWallets: 2,
      allowedRanks: Object.freeze([4, 5, 6, 7, 8]), // Ranks 1-3 are locked institutional alpha
      canAccessWebhooks: false,
      canExportCsv: false,
      canAccessAudioChimes: false,
      minAlertThresholdUsd: 1000000,
    }),
    PREMIUM: Object.freeze({
      maxTrackedWallets: 9999,
      canAccessWebhooks: true,
      canExportCsv: true,
      canAccessAudioChimes: true,
      canAccessInstitutionalDossier: true,
    }),
  }),

  DIAGNOSTICS: Object.freeze({
    coingeckoPingUrl: "https://api.coingecko.com/api/v3/ping",
    publicRpcPingUrl: "https://cloudflare-eth.com",
    healthCheckIntervalMs: 15000, // 15 seconds
  }),
});

