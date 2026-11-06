/**
 * @fileoverview Modal dialog for adding custom smart money wallets to the tracked ledger.
 */

import { useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import type { BlockchainChain } from "../../types/whaleWatcher";
import { Icon } from "../ui/Icon";

export function AddWalletModal() {
  const { isAddWalletOpen, setIsAddWalletOpen, addCustomWallet } = useWhaleWatcher();
  const [address, setAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [token, setToken] = useState("ETH");
  const [chain, setChain] = useState<BlockchainChain>("Ethereum");

  if (!isAddWalletOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    const success = addCustomWallet({
      address: address.trim(),
      alias: alias.trim(),
      token,
      chain,
    });

    if (success) {
      setAddress("");
      setAlias("");
      setIsAddWalletOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAddWalletOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1422] p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Icon name="wallet" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Add Smart Wallet</h3>
              <p className="text-[10px] text-slate-500">Track and receive alerts on any whale address</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddWalletOpen(false)}
            className="icon-button h-7 w-7 text-slate-500 hover:text-white"
            aria-label="Close"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Public Address or ENS <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="0x... or vitalik.eth"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.05]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Entity Alias / Label
            </label>
            <input
              type="text"
              placeholder="e.g. Alameda Liquidator, Paradigm LP"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.05]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Primary Asset
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#121929] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-blue-500/50"
              >
                <option value="ETH">ETH (Ethereum)</option>
                <option value="WBTC">WBTC (Bitcoin)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="LINK">LINK (Chainlink)</option>
                <option value="AAVE">AAVE (Aave)</option>
                <option value="ENA">ENA (Ethena)</option>
                <option value="UNI">UNI (Uniswap)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Blockchain
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value as BlockchainChain)}
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#121929] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-blue-500/50"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Solana">Solana</option>
                <option value="Base">Base</option>
                <option value="Arbitrum">Arbitrum</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setIsAddWalletOpen(false)}
              className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition hover:bg-blue-500"
            >
              <Icon name="eye" size={14} />
              Engage Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

