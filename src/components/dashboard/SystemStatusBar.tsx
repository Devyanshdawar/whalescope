/**
 * @fileoverview Professional System Health & API Diagnostics Status Bar.
 * 
 * Positioned discreetly along the dashboard footer to present real-time
 * telemetry for CoinGecko API, Ethereum RPC Public Nodes, and active
 * browser tracking queues. Includes buyer admin controls for Demo Mode.
 * 
 * @module components/dashboard/SystemStatusBar
 */

import { useState } from "react";
import { COMMERCIAL_SETTINGS } from "../../config/commercialConfig";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { Icon } from "../ui/Icon";

export function SystemStatusBar() {
  const {
    systemHealth,
    userTier,
    isDemoMode,
    toggleDemoMode,
    setUserTier,
    refreshDiagnostics,
    showToast,
  } = useWhaleWatcher();

  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const isCgRateLimited = systemHealth.coingeckoStatus === "Rate-Limited";
  const isCgDegraded = systemHealth.coingeckoStatus === "Degraded" || systemHealth.coingeckoStatus === "Offline";

  const isRpcDegraded = systemHealth.rpcNodeStatus !== "Connected";

  const handleToggleTier = () => {
    const nextTier = userTier === "Premium" ? "Free" : "Premium";
    setUserTier(nextTier);
    showToast(`User Access Tier switched to: ${nextTier}`);
  };

  return (
    <div className="relative mt-8 border-t border-white/[0.06] bg-[#080c14]/90 py-2.5 px-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3 text-[10px]">
        {/* Left: Real-time Node Telemetry */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-400">System Health:</span>
          </div>

          {/* CoinGecko API Badge */}
          <div
            className="relative flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setShowTooltip("cg")}
            onMouseLeave={() => setShowTooltip(null)}
            onClick={() => refreshDiagnostics()}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCgRateLimited
                  ? "bg-amber-400 ring-2 ring-amber-400/20"
                  : isCgDegraded
                  ? "bg-rose-400 ring-2 ring-rose-400/20"
                  : "bg-emerald-400 ring-2 ring-emerald-400/20"
              }`}
            />
            <span className="text-slate-400">CoinGecko:</span>
            <span
              className={`font-semibold ${
                isCgRateLimited
                  ? "text-amber-400"
                  : isCgDegraded
                  ? "text-rose-400"
                  : "text-slate-200"
              }`}
            >
              {systemHealth.coingeckoStatus} ({systemHealth.coingeckoLatencyMs}ms)
            </span>

            {/* Error Tooltip */}
            {showTooltip === "cg" && (
              <div className="absolute bottom-6 left-0 z-50 w-64 rounded-lg border border-white/10 bg-[#121929] p-2.5 text-[9px] text-slate-300 shadow-xl">
                <p className="font-semibold text-white">CoinGecko Pricing Endpoint</p>
                <p className="mt-1 text-slate-400">
                  {systemHealth.errorMessage ||
                    "Telemetry active. Auto-rate-limit throttling and memory caching layer engaged."}
                </p>
                <span className="mt-1 block text-slate-500">Click badge to re-ping node.</span>
              </div>
            )}
          </div>

          <span className="text-slate-800">·</span>

          {/* Ethereum RPC Node */}
          <div
            className="relative flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setShowTooltip("rpc")}
            onMouseLeave={() => setShowTooltip(null)}
            onClick={() => refreshDiagnostics()}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRpcDegraded
                  ? "bg-amber-400 ring-2 ring-amber-400/20"
                  : "bg-emerald-400 ring-2 ring-emerald-400/20"
              }`}
            />
            <span className="text-slate-400">Ethereum RPC:</span>
            <span className="font-semibold text-slate-200">
              {systemHealth.rpcNodeStatus} ({systemHealth.rpcLatencyMs}ms)
            </span>

            {showTooltip === "rpc" && (
              <div className="absolute bottom-6 left-0 z-50 w-60 rounded-lg border border-white/10 bg-[#121929] p-2.5 text-[9px] text-slate-300 shadow-xl">
                <p className="font-semibold text-white">Public RPC Node Mesh</p>
                <p className="mt-1 text-slate-400">
                  Redundant fallbacks to Cloudflare, Alchemy, and Moralis streams.
                </p>
              </div>
            )}
          </div>

          <span className="text-slate-800">·</span>

          {/* Active LocalStorage Wallets */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Icon name="wallet" size={11} className="text-cyan-400" />
            <span>Storage Queue:</span>
            <span className="font-mono font-semibold text-cyan-400">
              {systemHealth.activeTrackedWalletsCount} Tracked
            </span>
          </div>

          <span className="hidden text-slate-800 sm:inline">·</span>

          {/* Mempool Throughput */}
          <div className="hidden items-center gap-1.5 text-slate-400 sm:flex">
            <Icon name="activity" size={11} className="text-blue-400" />
            <span>Mempool Velocity:</span>
            <span className="font-mono font-semibold text-blue-400">
              {systemHealth.mempoolThroughputTpm} tx/min
            </span>
          </div>
        </div>

        {/* Right: Buyer Demo Mode & Tier Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Mode Master Switch */}
          <button
            onClick={() => toggleDemoMode()}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold transition ${
              isDemoMode
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/[0.03] text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle Demo Mode: Unlocks all premium features for review"
          >
            <span>Demo Mode:</span>
            <span>{isDemoMode ? "ON" : "OFF"}</span>
          </button>

          {/* User Tier Toggle Pill */}
          <button
            onClick={handleToggleTier}
            className={`rounded-md border px-2 py-1 text-[9px] font-bold transition ${
              userTier === "Premium"
                ? "border-blue-500/30 bg-blue-500/15 text-blue-400"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
            title="Click to toggle user tier between Free and Premium"
          >
            Tier: {userTier}
          </button>
        </div>
      </div>
    </div>
  );
}

