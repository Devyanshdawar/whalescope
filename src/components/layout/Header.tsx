import { useEffect, useRef, useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { CommandPaletteModal } from "../modals/CommandPaletteModal";
import { Icon } from "../ui/Icon";

export function Header({
  onMenu,
  searchQuery,
  onSearchChange,
}: {
  onMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}) {
  const {
    transactions,
    notifications,
    setIsAlertSettingsOpen,
    setSelectedTransaction,
    userTier,
    setIsPaywallOpen,
    showToast,
  } = useWhaleWatcher();

  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [internalSearch, setInternalSearch] = useState("");

  const searchVal = searchQuery !== undefined ? searchQuery : internalSearch;
  const handleSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Keyboard shortcut ⌘K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Duplicate for seamless endless marquee loop
  const displayTxs =
    transactions.length > 0
      ? [...transactions, ...transactions]
      : [];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0b0f19]/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 xl:px-8">
        <button className="icon-button lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <div className="search-wrap">
          <Icon name="search" size={17} className="text-slate-500" />
          <input
            aria-label="Search wallets or tokens"
            placeholder="Search wallet address, ENS or token..."
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden rounded border border-white/10 bg-white/[0.03] px-1.5 py-1 text-[9px] font-semibold text-slate-500 transition hover:bg-white/[0.08] hover:text-slate-300 sm:block"
            title="Open Command Palette (⌘K)"
          >
            ⌘ K
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="icon-button relative"
            aria-label="Alerts & Notification Settings"
            onClick={() => setIsAlertSettingsOpen(true)}
            title="Configure Alert Webhooks & Push Notifications"
          >
            <Icon name="bell" size={18} />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-2 ring-[#0b0f19]" />
            )}
          </button>
          <div className="relative" ref={profileRef}>
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <span className="avatar">AK</span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-semibold text-slate-100">Alex Kim</span>
                <span className="block text-[9px] text-slate-500">
                  {userTier === "Premium" ? "Pro member" : "Free tier"}
                </span>
              </span>
              <Icon name="chevron" size={14} className="hidden text-slate-500 sm:block" />
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <div className="border-b border-white/[0.06] px-3 py-2.5">
                  <p className="text-xs font-semibold text-white">alex@whalescope.io</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Connected with MetaMask</p>
                </div>
                <button onClick={() => { setIsAlertSettingsOpen(true); setProfileOpen(false); }}>
                  Alert & Webhook settings
                </button>
                <button onClick={() => { setIsPaywallOpen(true); setProfileOpen(false); }}>
                  Billing & membership ({userTier})
                </button>
                <button onClick={() => { showToast("Wallet portfolio synced"); setProfileOpen(false); }}>
                  View profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex h-9 items-center overflow-hidden border-t border-white/[0.04] bg-[#080c14]">
        <div className="flex h-full shrink-0 items-center gap-2 border-r border-white/[0.06] bg-cyan-400/[0.04] px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-400">
          <span className="live-dot" />
          Live feed
        </div>
        <div className="marquee flex min-w-0 flex-1 overflow-hidden" title="Click any transaction to inspect onchain details">
          <div className="marquee-track">
            {displayTxs.map((tx, index) => (
              <button
                type="button"
                className="flex shrink-0 items-center gap-2 text-left text-[10px] text-slate-400 transition hover:text-white"
                key={tx?.id ? `${tx.id}-${index}` : `tx-${index}`}
                onClick={() => tx && setSelectedTransaction(tx)}
              >
                <span
                  className={`font-semibold ${
                    tx?.isTrackedWallet ? "text-cyan-400" : "text-slate-200"
                  }`}
                >
                  {tx?.isTrackedWallet ? "★ " : ""}{tx?.action || `${tx?.wallet || "0x..."} transfer`}
                </span>
                <span className="font-semibold text-cyan-400">{tx?.value || "$--"}</span>
                <span className="text-slate-600">· {tx?.time || "Just now"}</span>
                <span className="mx-4 text-slate-800">◆</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Command Palette & Search Overlay (⌘K) */}
      <CommandPaletteModal isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
