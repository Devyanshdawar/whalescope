import { useState } from "react";
import { AnalyticsSidebar } from "./components/dashboard/AnalyticsSidebar";
import { StatCard } from "./components/dashboard/StatCard";
import { SystemStatusBar } from "./components/dashboard/SystemStatusBar";
import { WalletTable } from "./components/dashboard/WalletTable";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { AddWalletModal } from "./components/modals/AddWalletModal";
import { AlertSettingsModal } from "./components/modals/AlertSettingsModal";
import { PremiumPaywallModal } from "./components/modals/PremiumPaywallModal";
import { TransactionDetailModal } from "./components/modals/TransactionDetailModal";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Icon } from "./components/ui/Icon";
import { WhaleWatcherProvider, useWhaleWatcher } from "./context/WhaleWatcherContext";

function DashboardContent() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    marketStats,
    lastSyncedAgo,
    refreshWallets,
    isLoadingWallets,
    setIsAddWalletOpen,
  } = useWhaleWatcher();

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-300">
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div className="flex flex-1 flex-col lg:pl-[220px]">
        <Header
          onMenu={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="mx-auto w-full max-w-[1540px] flex-1 px-4 py-6 sm:px-6 xl:px-8 xl:py-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                <Icon name="shield" size={12} className="text-blue-500" />
                Institutional-grade intelligence
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[28px]">
                Smart Money Overview
              </h1>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Follow capital. Identify conviction. Move before the market.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshWallets()}
                className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-[9px] font-medium text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
                title="Click to manually refresh blockchain data"
              >
                <span className={`live-dot ${isLoadingWallets ? "animate-spin" : ""}`} />
                {isLoadingWallets ? "Syncing..." : lastSyncedAgo}
              </button>
              <button
                onClick={() => setIsAddWalletOpen(true)}
                className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,.24)] transition hover:bg-blue-500"
              >
                <Icon name="eye" size={14} />
                Add wallet
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <StatCard
              label="Total value tracked"
              value={marketStats?.totalValueTracked ?? "$842.67M"}
              delta={marketStats?.totalValueDelta ?? "+12.4%"}
              subtext="vs. last 24h"
              icon="wallet"
              variant="blue"
              chart="M0 32 C12 30 16 22 26 25 S42 14 50 20 S65 8 75 13 S86 4 96 6"
            />
            <StatCard
              label="Active whales online"
              value={marketStats?.activeWhalesOnline ?? "1,284"}
              delta={marketStats?.activeWhalesDelta ?? "+8.7%"}
              subtext="168 newly active"
              icon="activity"
              variant="cyan"
              chart="M0 27 C9 27 12 31 21 23 S34 27 43 17 S57 23 66 15 S82 18 96 4"
            />
            <StatCard
              label="24h smart money net flow"
              value={marketStats?.smartMoneyNetFlow ?? "+$38.42M"}
              delta={marketStats?.smartMoneyDelta ?? "+22.1%"}
              subtext="net accumulation"
              icon="trend"
              variant="green"
              chart="M0 34 C12 28 18 32 27 26 S40 22 49 24 S62 17 70 18 S83 8 96 7"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <WalletTable searchQuery={searchQuery} />
            <AnalyticsSidebar />
          </div>

          <footer className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/[0.04] py-4 text-[9px] text-slate-700 sm:flex-row">
            <span>© 2025 WhaleScope Intelligence</span>
            <span>Data aggregated across Ethereum, Solana, Base & Arbitrum</span>
          </footer>
        </main>

        {/* Real-Time System Health Diagnostics Bar */}
        <SystemStatusBar />
      </div>

      {/* Interactive Application Modals */}
      <AddWalletModal />
      <AlertSettingsModal />
      <TransactionDetailModal />
      <PremiumPaywallModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WhaleWatcherProvider>
        <DashboardContent />
      </WhaleWatcherProvider>
    </ErrorBoundary>
  );
}
