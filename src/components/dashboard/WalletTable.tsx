/**
 * @fileoverview Smart Wallets Ledger Table Component.
 * 
 * Renders dynamically-fetched smart money addresses, realized 24h P&L percentages,
 * historical win rates, primary conviction tokens, and interactive alert toggles.
 * Supports live searching, tracked filtering, multi-column sorting, CSV data export,
 * full ledger view, and entity portfolio dossier inspection.
 */

import { useMemo, useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import type { SmartWallet } from "../../types/whaleWatcher";
import { Icon } from "../ui/Icon";
import { WalletTableSkeleton } from "./WalletTableSkeleton";

type SortField = "rank" | "pnl" | "winRate";

export function WalletTable({ searchQuery = "" }: { searchQuery?: string }) {
  const {
    wallets,
    isLoadingWallets,
    walletError,
    refreshWallets,
    toggleTrack,
    setIsAddWalletOpen,
    showToast,
    isPremium,
    setIsPaywallOpen,
  } = useWhaleWatcher();

  const [filter, setFilter] = useState<"All wallets" | "Tracked">("All wallets");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copied, setCopied] = useState("");
  const [showFullLedgerModal, setShowFullLedgerModal] = useState(false);
  const [inspectedWallet, setInspectedWallet] = useState<SmartWallet | null>(null);

  // Filter & Search pipeline
  const filteredWallets = useMemo(() => {
    let result = wallets;

    // Filter by Tracked
    if (filter === "Tracked") {
      result = result.filter((w) => w.tracked);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.address.toLowerCase().includes(q) ||
          w.alias.toLowerCase().includes(q) ||
          w.token.toLowerCase().includes(q) ||
          (w.chain && w.chain.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "rank") {
        comparison = a.rank - b.rank;
      } else if (sortField === "pnl") {
        comparison = b.pnl - a.pnl;
      } else if (sortField === "winRate") {
        comparison = b.winRate - a.winRate;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [wallets, filter, searchQuery, sortField, sortAsc]);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(address);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "rank");
    }
  };

  /**
   * Generates and downloads an institutional CSV export of the active ledger.
   */
  const exportLedgerToCsv = () => {
    if (!isPremium) {
      setIsPaywallOpen(true);
      showToast("Exporting institutional CSV ledgers requires Alpha Sentinel Pro.");
      return;
    }

    if (!filteredWallets.length) {
      showToast("No wallets available to export");
      return;
    }

    const headers = ["Rank", "Alias", "Address", "24h PnL (%)", "Win Rate (%)", "Primary Token", "Chain", "Tracked"];
    const rows = filteredWallets.map((w) => [
      w.rank,
      `"${w.alias.replace(/"/g, '""')}"`,
      `"${w.address}"`,
      w.pnl,
      w.winRate,
      w.token,
      w.chain || "Ethereum",
      w.tracked ? "YES" : "NO",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `whalescope_smart_wallets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredWallets.length} wallets to CSV`);
  };

  return (
    <section className="panel min-w-0 xl:col-span-8">
      {/* Table Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-white">
              Top Smart Wallets Ledger
            </h2>
            <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-400">
              TOP 100
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Ranked by realized P&L, win rate and onchain conviction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="segmented">
            {(["All wallets", "Tracked"] as const).map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={exportLedgerToCsv}
            className="icon-button h-8 w-8 text-slate-400 hover:text-white"
            title="Export Ledger to CSV"
            aria-label="Export CSV"
          >
            <Icon name="copy" size={14} />
          </button>
          <button
            onClick={() => refreshWallets()}
            className="icon-button h-8 w-8 text-slate-400 hover:text-white"
            title="Force refresh ledger from blockchain"
            aria-label="Refresh ledger"
          >
            <Icon name="activity" size={14} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {walletError && (
        <div className="flex items-center justify-between border-b border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-xs text-rose-300">
          <span>{walletError}</span>
          <button
            onClick={() => refreshWallets()}
            className="rounded bg-rose-500/20 px-2 py-1 text-[10px] font-semibold hover:bg-rose-500/30"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr>
              <th
                className="cursor-pointer transition hover:text-slate-300"
                onClick={() => toggleSort("rank")}
              >
                <div className="flex items-center gap-1">
                  Rank {sortField === "rank" && (sortAsc ? "↑" : "↓")}
                </div>
              </th>
              <th>Wallet address</th>
              <th
                className="cursor-pointer transition hover:text-slate-300"
                onClick={() => toggleSort("pnl")}
              >
                <div className="flex items-center gap-1">
                  24h P&L {sortField === "pnl" && (sortAsc ? "↑" : "↓")}
                </div>
              </th>
              <th
                className="cursor-pointer transition hover:text-slate-300"
                onClick={() => toggleSort("winRate")}
              >
                <div className="flex items-center gap-1">
                  Win rate {sortField === "winRate" && (sortAsc ? "↑" : "↓")}
                </div>
              </th>
              <th>Primary token</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingWallets ? (
              <WalletTableSkeleton rows={6} />
            ) : (
              filteredWallets.map((wallet) => {
                const isRestricted = !isPremium && wallet.rank <= 3;

                return (
                  <tr key={wallet.address}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`rank ${wallet.rank <= 3 ? `rank-${wallet.rank}` : ""}`}>
                          {wallet.rank.toString().padStart(2, "0")}
                        </span>
                        {isRestricted && (
                          <span
                            className="cursor-pointer rounded bg-blue-500/15 px-1 py-0.5 text-[8px] font-bold text-blue-400"
                            onClick={() => {
                              setIsPaywallOpen(true);
                              showToast(`Rank #${wallet.rank} is gated for Alpha Sentinel Pro.`);
                            }}
                            title="Pro Alpha Tier Locked"
                          >
                            PRO
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="wallet-identicon cursor-pointer transition hover:scale-105"
                          onClick={() => {
                            if (isRestricted) {
                              setIsPaywallOpen(true);
                              showToast(`Rank #${wallet.rank} (${wallet.alias}) is reserved for Pro members.`);
                            } else {
                              setInspectedWallet(wallet);
                            }
                          }}
                          title={isRestricted ? "Unlock Pro Alpha" : "View Entity Dossier"}
                        >
                          <span style={{ transform: `rotate(${wallet.rank * 32}deg)` }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (isRestricted) {
                                  setIsPaywallOpen(true);
                                  showToast(`Rank #${wallet.rank} (${wallet.alias}) is reserved for Pro members.`);
                                } else {
                                  setInspectedWallet(wallet);
                                }
                              }}
                              className="text-left font-mono text-[11px] font-medium text-slate-200 transition hover:text-cyan-400"
                              title={isRestricted ? "Click to unlock Pro access" : "Inspect wallet profile"}
                            >
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </button>
                            <button
                              className="copy-button"
                              onClick={() => copyAddress(wallet.address)}
                              aria-label={`Copy ${wallet.address}`}
                            >
                              {copied === wallet.address ? (
                                <span className="text-[9px] text-emerald-400">Copied</span>
                              ) : (
                                <Icon name="copy" size={12} />
                              )}
                            </button>
                          </div>
                          <p
                            className="mt-1 cursor-pointer text-[9px] text-slate-500 transition hover:text-slate-300"
                            onClick={() => {
                              if (isRestricted) {
                                setIsPaywallOpen(true);
                              } else {
                                setInspectedWallet(wallet);
                              }
                            }}
                          >
                            {wallet.alias}
                          </p>
                        </div>
                      </div>
                    </td>
                  <td>
                    <span className={`pnl ${(wallet?.pnl ?? 0) >= 0 ? "positive" : "negative"}`}>
                      {(wallet?.pnl ?? 0) >= 0 ? "+" : ""}
                      {wallet?.pnl ?? 0}%
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-300">
                        {wallet?.winRate ?? 0}%
                      </span>
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(0, wallet?.winRate ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className="token-dot"
                        style={{
                          background: wallet?.tokenColor || "#3b82f6",
                          boxShadow: `0 0 10px ${wallet?.tokenColor || "#3b82f6"}55`,
                        }}
                      >
                        {wallet?.token?.[0] || "E"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">
                        {wallet?.token || "ETH"}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => toggleTrack(wallet.address)}
                      className={`track-button ${wallet.tracked ? "tracking" : ""}`}
                      title={wallet.tracked ? "Tracking active - alerts enabled" : "Enable alerts for this wallet"}
                    >
                      {wallet.tracked ? (
                        <>
                          <span className="live-dot" />
                          Alert on
                        </>
                      ) : (
                        <>
                          Track <span>+</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>

        {/* Empty States */}
        {!isLoadingWallets && filteredWallets.length === 0 && (
          <div className="py-16 text-center">
            <Icon name="wallet" size={28} className="mx-auto text-slate-700" />
            <p className="mt-3 text-xs text-slate-400">
              {filter === "Tracked"
                ? "No tracked wallets in your active queue yet."
                : "No smart wallets match your search filter."}
            </p>
            {filter === "Tracked" && (
              <button
                onClick={() => setFilter("All wallets")}
                className="mt-3 text-[10px] font-semibold text-cyan-400 hover:underline"
              >
                Browse All Wallets
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Footer Bar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3.5">
        <p className="text-[9px] text-slate-600">
          Showing {filteredWallets.length} of {wallets.length} smart wallets
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={exportLedgerToCsv}
            className="text-[10px] font-semibold text-slate-400 transition hover:text-white"
          >
            Export CSV
          </button>
          <span className="text-slate-800">·</span>
          <button
            onClick={() => setShowFullLedgerModal(true)}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400 transition hover:text-blue-300"
          >
            View full ledger <Icon name="external" size={12} />
          </button>
        </div>
      </div>

      {/* Entity Dossier Profile Modal */}
      {inspectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setInspectedWallet(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1422] p-6 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="wallet-identicon h-9 w-9">
                  <span style={{ transform: `rotate(${inspectedWallet.rank * 32}deg)` }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{inspectedWallet.alias}</h3>
                  <p className="font-mono text-[10px] text-slate-500">
                    {inspectedWallet.address.slice(0, 10)}...{inspectedWallet.address.slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedWallet(null)}
                className="icon-button h-7 w-7 text-slate-500 hover:text-white"
              >
                <Icon name="x" size={14} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">
                    Conviction Score
                  </span>
                  <p className="mt-1 text-lg font-bold text-cyan-400">
                    {inspectedWallet.convictionScore || 92}
                    <span className="text-xs text-slate-500">/100</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">
                    Est. Portfolio
                  </span>
                  <p className="mt-1 text-lg font-bold text-white">
                    {inspectedWallet.balanceUsd
                      ? `$${(inspectedWallet.balanceUsd / 1000000).toFixed(1)}M`
                      : "$84.5M"}
                  </p>
                </div>
              </div>

              {/* 24h PnL & Win Rate Details */}
              <div className="rounded-xl border border-white/[0.05] bg-black/30 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">24-Hour Realized P&L:</span>
                  <span
                    className={`font-semibold ${inspectedWallet.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {inspectedWallet.pnl >= 0 ? "+" : ""}
                    {inspectedWallet.pnl}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Historical 30-Day Win Rate:</span>
                  <span className="font-semibold text-white">{inspectedWallet.winRate}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Primary Accumulation Asset:</span>
                  <span className="font-semibold text-slate-200">{inspectedWallet.token}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Network:</span>
                  <span className="font-semibold text-slate-200">{inspectedWallet.chain || "Ethereum"}</span>
                </div>
              </div>

              {/* External Explorer Links */}
              <div className="flex items-center gap-3 text-[10px]">
                <a
                  href={`https://etherscan.io/address/${inspectedWallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  Etherscan <Icon name="external" size={11} />
                </a>
                <span className="text-slate-800">·</span>
                <a
                  href={`https://debank.com/profile/${inspectedWallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  DeBank Profile <Icon name="external" size={11} />
                </a>
                <span className="text-slate-800">·</span>
                <a
                  href={`https://platform.arkhamintelligence.com/explorer/address/${inspectedWallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                >
                  Arkham Entity <Icon name="external" size={11} />
                </a>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <button
                  onClick={() => copyAddress(inspectedWallet.address)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  <Icon name="copy" size={13} />
                  {copied === inspectedWallet.address ? "Copied" : "Copy Address"}
                </button>
                <button
                  onClick={() => toggleTrack(inspectedWallet.address)}
                  className={`track-button ${inspectedWallet.tracked ? "tracking" : ""}`}
                >
                  {inspectedWallet.tracked ? (
                    <>
                      <span className="live-dot" />
                      Alert on
                    </>
                  ) : (
                    <>
                      Track <span>+</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Ledger Modal */}
      {showFullLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowFullLedgerModal(false)}
          />
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1422] p-6 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Institutional Smart Money Ledger</h3>
                <p className="text-[10px] text-slate-500">
                  Comprehensive onchain portfolio valuations and conviction rankings
                </p>
              </div>
              <button
                onClick={() => setShowFullLedgerModal(false)}
                className="icon-button h-7 w-7 text-slate-500 hover:text-white"
              >
                <Icon name="x" size={14} />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5">Entity</th>
                    <th>Network</th>
                    <th>Conviction</th>
                    <th>Portfolio Est.</th>
                    <th>24h P&L</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {wallets.map((w) => (
                    <tr key={`full-${w.address}`} className="hover:bg-white/[0.02]">
                      <td className="py-3">
                        <span className="font-semibold text-white">{w.alias}</span>
                        <span className="block font-mono text-[10px] text-slate-500">{w.address}</span>
                      </td>
                      <td className="text-slate-300">{w.chain || "Ethereum"}</td>
                      <td>
                        <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400">
                          {w.convictionScore || 90}/100
                        </span>
                      </td>
                      <td className="font-mono text-slate-300">
                        {w.balanceUsd ? `$${(w.balanceUsd / 1000000).toFixed(1)}M` : "$42.5M"}
                      </td>
                      <td>
                        <span className={`font-semibold ${w.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {w.pnl >= 0 ? "+" : ""}{w.pnl}%
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => toggleTrack(w.address)}
                          className={`track-button ${w.tracked ? "tracking" : ""}`}
                        >
                          {w.tracked ? "Alert on" : "Track +"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <button
                onClick={exportLedgerToCsv}
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Download CSV
              </button>
              <button
                onClick={() => {
                  setShowFullLedgerModal(false);
                  setIsAddWalletOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Icon name="eye" size={14} /> Add custom wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
