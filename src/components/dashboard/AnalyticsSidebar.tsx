/**
 * @fileoverview Analytics Sidebar Component.
 * 
 * Displays dynamically-ranked trending tokens with capital flows and the
 * real-time Live Notification Stream fed by the AlertNotificationService.
 */

import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { Icon } from "../ui/Icon";

export function AnalyticsSidebar() {
  const {
    notifications,
    clearNotifications,
    trendingTokens,
    transactions,
    setSelectedTransaction,
    setIsAlertSettingsOpen,
  } = useWhaleWatcher();

  const handleNotificationClick = (notifId: string | number) => {
    const notif = notifications.find((n) => n.id === notifId);
    if (!notif) return;

    // Check if matching transaction exists in live stream
    if (notif.txHash) {
      const match = transactions.find((t) => t.hash === notif.txHash);
      if (match) {
        setSelectedTransaction(match);
        return;
      }
    }

    // Otherwise create detail preview for inspection
    if (notif.walletAddress) {
      setSelectedTransaction({
        id: `preview-${notif.id}`,
        hash: notif.txHash || "0x7a8f1b2c3d4e5f60718293a4b5c6d7e8f9012345",
        fromAddress: notif.walletAddress,
        toAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
        wallet: notif.title.replace("Tracked Whale Alert: ", ""),
        action: notif.text,
        txType: "SWAP",
        tokenSymbol: "ETH",
        tokenAmount: 250,
        value: notif.value,
        valueUsd: 657000,
        time: notif.time,
        timestamp: notif.timestamp,
        chain: "Ethereum",
        isTrackedWallet: true,
      });
    }
  };

  return (
    <aside className="space-y-4 xl:col-span-4">
      {/* Trending Tokens Panel */}
      <section className="panel">
        <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="flame" size={15} className="text-orange-400" />
              <h2 className="text-xs font-semibold text-white">Trending Tokens</h2>
            </div>
            <p className="mt-1 text-[9px] text-slate-600">Most bought by tracked whales · 24h</p>
          </div>
          <button
            className="text-slate-600 transition hover:text-white"
            title="Aggregated onchain smart money inflow"
          >
            <Icon name="more" size={18} />
          </button>
        </div>
        <div className="p-3">
          {(trendingTokens || []).map((token, index) => (
            <div className="token-row" key={token?.symbol || `token-${index}`}>
              <span className="w-4 text-center text-[9px] font-semibold text-slate-700">
                {index + 1}
              </span>
              <span
                className="token-dot h-8 w-8 text-[10px]"
                style={{ background: token?.color || "#3b82f6" }}
              >
                {token?.symbol?.[0] || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-white">
                      {token?.symbol || "--"}
                    </span>
                    <span className="ml-1.5 text-[9px] text-slate-600">
                      {token?.name || ""}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {token?.change || "+0.0%"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${Math.min(100, Math.max(0, token?.share || 50))}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[9px] text-slate-500">
                    {token?.flow || "$0M"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Notification Stream Panel */}
      <section className="panel">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <h2 className="text-xs font-semibold text-white">Live Notification Stream</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-[9px] font-medium text-slate-500 transition hover:text-cyan-400"
              onClick={() => setIsAlertSettingsOpen(true)}
              title="Configure Webhooks"
            >
              Config
            </button>
            <span className="text-slate-800">·</span>
            <button
              className="text-[9px] font-medium text-slate-600 transition hover:text-slate-300"
              onClick={clearNotifications}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="min-h-[250px] p-2">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                className="notification cursor-pointer"
                key={notification?.id || Math.random()}
                onClick={() => notification?.id && handleNotificationClick(notification.id)}
                title="Click to view onchain details"
              >
                <div className={`notification-icon ${notification?.color || "blue"}`}>
                  <Icon
                    name={
                      notification?.color === "green"
                        ? "trend"
                        : notification?.color === "cyan"
                          ? "activity"
                          : "wallet"
                    }
                    size={14}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[10px] font-semibold text-slate-200">
                      {notification?.title || "Onchain Movement"}
                    </p>
                    <span className="shrink-0 text-[8px] text-slate-700">
                      {notification?.time || "Recently"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[9px] text-slate-500">
                    {notification?.text || "High-value smart money transfer"}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] font-semibold text-cyan-400">
                    {notification?.value || "$--"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-[230px] flex-col items-center justify-center text-center">
              <Icon name="bell" size={24} className="text-slate-700" />
              <p className="mt-3 text-[10px] text-slate-500">You’re all caught up</p>
            </div>
          )}
        </div>
        <div className="border-t border-white/[0.06] px-5 py-3">
          <button
            onClick={() => setIsAlertSettingsOpen(true)}
            className="w-full text-center text-[9px] font-semibold text-blue-400 transition hover:text-blue-300"
          >
            Manage Alert Webhooks & Web Push
          </button>
        </div>
      </section>
    </aside>
  );
}
