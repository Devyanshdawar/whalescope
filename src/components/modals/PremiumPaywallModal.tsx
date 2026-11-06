/**
 * @fileoverview Premium Paywall & Checkout Gateway Simulation Modal.
 * 
 * Intercepts restricted tier actions (accessing top alpha wallets, setting webhooks,
 * exceeding tracking quotas) and provides a simulated Stripe & Web3 Crypto
 * payment activation pipeline.
 */

import { useState } from "react";
import { COMMERCIAL_SETTINGS } from "../../config/commercialConfig";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { Icon } from "../ui/Icon";

export function PremiumPaywallModal() {
  const { isPaywallOpen, setIsPaywallOpen, activatePremium, showToast } = useWhaleWatcher();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentTab, setPaymentTab] = useState<"stripe" | "crypto">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPaywallOpen) return null;

  const price =
    billingCycle === "monthly"
      ? COMMERCIAL_SETTINGS.PRICING.monthlyPriceUsd
      : Math.round(COMMERCIAL_SETTINGS.PRICING.annualPriceUsd / 12);

  const handleActivation = async () => {
    setIsProcessing(true);
    const success = await activatePremium(paymentTab);
    setIsProcessing(false);

    if (success) {
      showToast("🎉 Premium Alpha Sentinel activated! All restricted alpha unlocked.");
      setIsPaywallOpen(false);
    } else {
      showToast("Activation simulation failed. Please retry.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => !isProcessing && setIsPaywallOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-blue-500/20 bg-[#0e1422] p-6 shadow-2xl shadow-blue-500/10 sm:p-7">
        {/* Close Button */}
        <button
          onClick={() => setIsPaywallOpen(false)}
          disabled={isProcessing}
          className="icon-button absolute right-5 top-5 h-7 w-7 text-slate-500 hover:text-white disabled:opacity-40"
          aria-label="Close"
        >
          <Icon name="x" size={14} />
        </button>

        {/* Modal Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            <Icon name="sparkles" size={12} />
            Institutional Alpha Gateway
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Unlock Real-Time Smart Money Alpha
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Gain immediate access to Tier-1 institutional wallet ledgers, zero-delay mempool feeds,
            and instant Telegram / Discord alert webhooks.
          </p>
        </div>

        {/* Pricing Selector */}
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 p-1.5 sm:justify-start">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              billingCycle === "monthly"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly ({COMMERCIAL_SETTINGS.PRICING.currencySymbol}
            {COMMERCIAL_SETTINGS.PRICING.monthlyPriceUsd}/mo)
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              billingCycle === "annual"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Annual (Save {COMMERCIAL_SETTINGS.PRICING.discountPercentAnnual}%)
          </button>
        </div>

        {/* Feature Matrix */}
        <div className="mt-5 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">
              ✓
            </span>
            <span>
              <strong>Ranks 1–3 Unlocked:</strong> Jump Trading, Wintermute & Amber Group onchain conviction
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">
              ✓
            </span>
            <span>
              <strong>Outbound Webhooks:</strong> Push automated alerts to Discord & Telegram bots
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">
              ✓
            </span>
            <span>
              <strong>Unlimited Watchlist:</strong> Track infinite wallets with zero memory caps
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">
              ✓
            </span>
            <span>
              <strong>Institutional Exports:</strong> Instant CSV & JSON portfolio ledger downloads
            </span>
          </div>
        </div>

        {/* Payment Rails Selector */}
        <div className="mt-5">
          <div className="flex border-b border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => setPaymentTab("stripe")}
              className={`pb-2.5 pr-4 transition ${
                paymentTab === "stripe"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Credit Card (Stripe Gateway)
            </button>
            <button
              onClick={() => setPaymentTab("crypto")}
              className={`pb-2.5 px-4 transition ${
                paymentTab === "crypto"
                  ? "border-b-2 border-cyan-500 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Web3 Crypto Pay (USDC / ETH)
            </button>
          </div>

          {paymentTab === "stripe" ? (
            <div className="mt-3.5 space-y-3">
              <div className="rounded-lg border border-white/[0.08] bg-black/20 p-3">
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Stripe Test Card Simulation
                </span>
                <div className="mt-1 flex items-center justify-between font-mono text-xs text-slate-300">
                  <span>•••• •••• •••• 4242</span>
                  <span>12/28 · CVC 999</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Icon name="shield" size={11} className="text-emerald-400" />
                  256-bit TLS Gateway
                </span>
                <span className="font-mono text-[9px]">
                  Stripe PK: {COMMERCIAL_SETTINGS.GATEWAYS.stripePublishableKey.slice(0, 14)}...
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              <div className="rounded-lg border border-white/[0.08] bg-black/20 p-3">
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Direct Treasury Deposit (USDC / ETH)
                </span>
                <span className="mt-1 block break-all font-mono text-[11px] text-cyan-400">
                  {COMMERCIAL_SETTINGS.GATEWAYS.cryptoTreasuryAddress}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Accepted: {COMMERCIAL_SETTINGS.GATEWAYS.acceptedCryptoCurrencies.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-white/[0.06] pt-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Due Today</span>
            <div className="text-xl font-bold text-white">
              {COMMERCIAL_SETTINGS.PRICING.currencySymbol}
              {billingCycle === "monthly" ? price : COMMERCIAL_SETTINGS.PRICING.annualPriceUsd}
              <span className="text-xs font-normal text-slate-500">
                /{billingCycle === "monthly" ? "mo" : "year"}
              </span>
            </div>
          </div>

          <button
            onClick={handleActivation}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="live-dot animate-spin" />
                <span>Simulating Payment Gateway...</span>
              </>
            ) : (
              <>
                <Icon name="sparkles" size={14} />
                <span>Simulate Premium Activation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

