/**
 * @fileoverview Modal for inspecting onchain whale transaction details.
 */

import { useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { Icon } from "../ui/Icon";

export function TransactionDetailModal() {
  const { selectedTransaction, setSelectedTransaction, toggleTrack, wallets } = useWhaleWatcher();
  const [copied, setCopied] = useState(false);

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;
  const isTracked = wallets.some(
    (w) => w.address.toLowerCase() === tx.fromAddress.toLowerCase() && w.tracked
  );

  const copyHash = async () => {
    await navigator.clipboard.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const explorerUrl =
    tx.chain === "Solana"
      ? `https://solscan.io/tx/${tx.hash}`
      : tx.chain === "Base"
      ? `https://basescan.org/tx/${tx.hash}`
      : tx.chain === "Arbitrum"
      ? `https://arbiscan.io/tx/${tx.hash}`
      : `https://etherscan.io/tx/${tx.hash}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setSelectedTransaction(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1422] p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Icon name="activity" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Onchain Transaction Inspector</h3>
              <p className="text-[10px] text-slate-500">Verified institutional transfer data</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTransaction(null)}
            className="icon-button h-7 w-7 text-slate-500 hover:text-white"
            aria-label="Close"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Main Value Banner */}
          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total USD Valuation
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-cyan-400">{tx.value}</span>
              <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                {tx.tokenAmount.toLocaleString()} {tx.tokenSymbol}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-300">{tx.action}</p>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Network / Chain</span>
              <p className="mt-1 font-semibold text-white">{tx.chain}</p>
            </div>
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Block Height</span>
              <p className="mt-1 font-semibold text-white">#{tx.blockNumber || 21124800}</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500">From (Origin Entity)</span>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs">
                <span className="font-mono text-slate-300">
                  {tx.fromAddress.slice(0, 10)}...{tx.fromAddress.slice(-8)}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{tx.wallet}</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Transaction Hash</span>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs">
                <span className="truncate font-mono text-slate-400">{tx.hash}</span>
                <button onClick={copyHash} className="ml-2 text-slate-500 hover:text-white">
                  {copied ? (
                    <span className="text-[9px] text-emerald-400">Copied</span>
                  ) : (
                    <Icon name="copy" size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              View on Explorer <Icon name="external" size={13} />
            </a>

            <button
              onClick={() => toggleTrack(tx.fromAddress)}
              className={`track-button ${isTracked ? "tracking" : ""}`}
            >
              {isTracked ? (
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
  );
}

