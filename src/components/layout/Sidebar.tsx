import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { navItems } from "../../data/dashboardData";
import { Icon } from "../ui/Icon";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="logo-mark">
        <span />
        <span />
        <span />
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-[-0.02em] text-white">
          Whale<span className="text-cyan-400">Scope</span>
        </div>
        <div className="text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Onchain intelligence
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  active,
  setActive,
  open,
  setOpen,
}: {
  active: string;
  setActive: (item: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const {
    wallets,
    notifications,
    indexerStatus,
    setIsAlertSettingsOpen,
    setIsPaywallOpen,
    userTier,
    isPremium,
    showToast,
  } = useWhaleWatcher();

  const trackedCount = wallets.filter((w) => w.tracked).length;

  const handleNavClick = (label: string) => {
    setActive(label);
    setOpen(false);

    if (label === "Live Alerts" || label === "Settings") {
      setIsAlertSettingsOpen(true);
    } else if (label === "Pricing Tier") {
      setIsPaywallOpen(true);
    }
  };

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6">
          <Logo />
          <button
            className="icon-button lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                className={`nav-item ${active === item.label ? "nav-item-active" : ""}`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.label === "Live Alerts" && (
                  <span className="ml-auto rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                    {notifications.length}
                  </span>
                )}
                {item.label === "Watchlist" && trackedCount > 0 && (
                  <span className="ml-auto rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {trackedCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-1 pt-8">
            <div className="upgrade-card">
              <div className="relative z-10">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-300">
                  <Icon name="sparkles" size={17} />
                </div>
                <p className="text-sm font-semibold text-white">
                  {isPremium ? "Alpha Sentinel Active" : "Institutional Suite"}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                  {isPremium
                    ? `Tracking ${trackedCount} smart wallets with low-latency mempool feeds.`
                    : "Unlock Tier-1 market maker wallets and multi-channel webhooks."}
                </p>
                <button
                  onClick={() => {
                    if (isPremium) {
                      setIsAlertSettingsOpen(true);
                    } else {
                      setIsPaywallOpen(true);
                    }
                  }}
                  className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-50"
                >
                  {isPremium ? "Configure Webhooks" : "Unlock Real-Time Alpha"}
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-slate-500" title={`Block #${indexerStatus.blockHeight}`}>
              <span className="status-dot" />
              <span className="truncate">{indexerStatus.provider} ({indexerStatus.latencyMs}ms)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
