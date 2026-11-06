/**
 * @fileoverview Command Palette & Global Search Modal (⌘K).
 * 
 * Provides instantaneous keyboard-driven exploration of institutional smart wallets,
 * tracked entities, cryptocurrency assets, and recent high-conviction transactions.
 * 
 * @module components/modals/CommandPaletteModal
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import type { SmartWallet, WhaleTransaction } from "../../types/whaleWatcher";
import { Icon } from "../ui/Icon";

export function CommandPaletteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    wallets,
    transactions,
    trendingTokens,
    toggleTrack,
    setSelectedTransaction,
    setIsAddWalletOpen,
    setIsAlertSettingsOpen,
    setIsPaywallOpen,
    showToast,
  } = useWhaleWatcher();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global ⌘K / Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Results
  const matchingWallets = useMemo(() => {
    if (!query.trim()) return wallets.slice(0, 5);
    const q = query.toLowerCase().trim();
    return wallets.filter(
      (w) =>
        w.alias.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.token.toLowerCase().includes(q)
    );
  }, [wallets, query]);

  const matchingTransactions = useMemo(() => {
    if (!query.trim()) return transactions.slice(0, 3);
    const q = query.toLowerCase().trim();
    return transactions.filter(
      (t) =>
        t.wallet.toLowerCase().includes(q) ||
        t.action.toLowerCase().includes(q) ||
        t.tokenSymbol.toLowerCase().includes(q) ||
        t.hash.toLowerCase().includes(q)
    );
  }, [transactions, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1320] shadow-2xl shadow-black/90">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <Icon name="search" size={18} className="text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search smart wallets, verified entities, tokens, or tx hash..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {/* Quick Actions Section */}
          {!query.trim() && (
            <div className="mb-2 px-2 py-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                Quick Actions
              </span>
              <div className="mt-1 grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    onClose();
                    setIsAddWalletOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 text-left text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon name="eye" size={13} className="text-blue-400" />
                  <span className="text-[10px] font-semibold">Track Wallet</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setIsAlertSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 text-left text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon name="bell" size={13} className="text-cyan-400" />
                  <span className="text-[10px] font-semibold">Alert Config</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setIsPaywallOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 text-left text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon name="sparkles" size={13} className="text-purple-400" />
                  <span className="text-[10px] font-semibold">Unlock Pro</span>
                </button>
              </div>
            </div>
          )}

          {/* Smart Wallets */}
          <div className="mb-3">
            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Smart Money Wallets ({matchingWallets.length})
            </div>
            {matchingWallets.length ? (
              matchingWallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="token-dot h-6 w-6 text-[9px]" style={{ background: wallet.tokenColor }}>
                      {wallet.token[0]}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{wallet.alias}</span>
                        <span className="font-mono text-[9px] text-slate-500">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {wallet.chain || "Ethereum"} · {wallet.winRate}% Win Rate · {wallet.pnl >= 0 ? "+" : ""}{wallet.pnl}% 24h
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleTrack(wallet.address);
                    }}
                    className={`rounded-md px-2 py-1 text-[9px] font-semibold transition ${
                      wallet.tracked
                        ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    {wallet.tracked ? "Tracking" : "+ Track"}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-[10px] text-slate-600">No matching wallets</div>
            )}
          </div>

          {/* Transactions */}
          <div>
            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Recent Onchain Transfers
            </div>
            {matchingTransactions.length ? (
              matchingTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTransaction(tx);
                    onClose();
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name="activity" size={13} className="text-cyan-400" />
                    <div>
                      <p className="font-semibold text-slate-200">{tx.wallet} · {tx.action}</p>
                      <p className="font-mono text-[9px] text-slate-500">{tx.chain} · {tx.time}</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-cyan-400">{tx.value}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-[10px] text-slate-600">No matching transactions</div>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/20 px-4 py-2.5 text-[9px] text-slate-500">
          <span>Navigate with arrows · Enter to inspect</span>
          <span className="font-mono">WhaleScope Intelligence</span>
        </div>
      </div>
    </div>
  );
}

