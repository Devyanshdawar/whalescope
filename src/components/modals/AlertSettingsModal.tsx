/**
 * @fileoverview Modal dialog for configuring external Webhooks (Discord, Telegram),
 * browser notifications, audio chimes, and alert trigger thresholds.
 */

import { useState } from "react";
import { useWhaleWatcher } from "../../context/WhaleWatcherContext";
import { alertService } from "../../services/AlertNotificationService";
import { Icon } from "../ui/Icon";

export function AlertSettingsModal() {
  const {
    isAlertSettingsOpen,
    setIsAlertSettingsOpen,
    settings,
    updateSettings,
    showToast,
    isPremium,
    setIsPaywallOpen,
  } = useWhaleWatcher();

  const [discordUrl, setDiscordUrl] = useState(settings.discordWebhookUrl);
  const [telegramToken, setTelegramToken] = useState(settings.telegramBotToken);
  const [telegramChat, setTelegramChat] = useState(settings.telegramChatId);
  const [threshold, setThreshold] = useState(settings.minAlertThresholdUsd);
  const [browserNotifs, setBrowserNotifs] = useState(settings.browserNotificationsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  if (!isAlertSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if free user is attempting to save external webhook integrations
    if (!isPremium && (discordUrl.trim() || telegramToken.trim())) {
      setIsPaywallOpen(true);
      showToast("Discord and Telegram Webhooks require an active Alpha Sentinel Pro license.");
      return;
    }

    updateSettings({
      discordWebhookUrl: discordUrl,
      telegramBotToken: telegramToken,
      telegramChatId: telegramChat,
      minAlertThresholdUsd: Number(threshold),
      browserNotificationsEnabled: browserNotifs,
      soundEnabled: soundEnabled,
    });
    setIsAlertSettingsOpen(false);
  };

  const handleTestChime = () => {
    alertService.playAudioChime(880, 0.2);
    showToast("Synthesized alert chime played");
  };

  const handleRequestPermission = async () => {
    const perm = await alertService.requestBrowserNotificationPermission();
    if (perm === "granted") {
      setBrowserNotifs(true);
      showToast("Browser notification permissions granted!");
    } else {
      showToast(`Notification permission: ${perm}`);
    }
  };

  const handleTestDiscord = async () => {
    if (!isPremium) {
      setIsPaywallOpen(true);
      showToast("Webhook automated bot dispatches require an active Premium license.");
      return;
    }
    if (!discordUrl.trim()) {
      showToast("Please provide a valid Discord Webhook URL first.");
      return;
    }
    setIsTestingWebhook(true);
    const mockTx = {
      id: "test-tx",
      hash: "0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      fromAddress: "0x71C8F4A296E37B1234F89D5123A7C921",
      toAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
      wallet: "Jump Trading",
      action: "executed test webhook dispatch",
      txType: "SWAP" as const,
      tokenSymbol: "ETH",
      tokenAmount: 500,
      value: "$1.31M",
      valueUsd: 1314070,
      time: "Just now",
      timestamp: Date.now(),
      chain: "Ethereum" as const,
      isTrackedWallet: true,
    };

    const ok = await alertService.dispatchDiscordWebhook(mockTx, "WhaleScope Test Sentinel");
    setIsTestingWebhook(false);
    if (ok) {
      showToast("Test payload successfully delivered to Discord!");
    } else {
      showToast("Discord webhook test failed. Verify webhook URL.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAlertSettingsOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0e1422] p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Icon name="bell" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Alerts & Webhook Configuration</h3>
              <p className="text-[10px] text-slate-500">
                Push real-time whale movements to Discord, Telegram & Browser
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertSettingsOpen(false)}
            className="icon-button h-7 w-7 text-slate-500 hover:text-white"
            aria-label="Close"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Discord Webhook */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Discord Incoming Webhook URL
              </label>
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={isTestingWebhook || !discordUrl}
                className="text-[9px] font-semibold text-cyan-400 transition hover:text-cyan-300 disabled:opacity-40"
              >
                {isTestingWebhook ? "Sending..." : "Test Webhook"}
              </button>
            </div>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-500/50"
            />
            <p className="mt-1 text-[9px] text-slate-500">
              Dispatches rich embedded messages with onchain links whenever a tracked wallet transacts.
            </p>
          </div>

          {/* Telegram Bot */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Telegram Bot Token
              </label>
              <input
                type="text"
                placeholder="123456:ABC-DEF..."
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Telegram Target Chat ID
              </label>
              <input
                type="text"
                placeholder="-100123456789"
                value={telegramChat}
                onChange={(e) => setTelegramChat(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Minimum Value Threshold */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Outbound Alert Threshold (USD)
              </label>
              <span className="font-mono text-xs font-bold text-cyan-400">
                ${Number(threshold).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/[0.08] accent-cyan-400"
            />
            <div className="mt-1 flex justify-between text-[8px] text-slate-600">
              <span>$50K</span>
              <span>$1M</span>
              <span>$2.5M</span>
              <span>$5M</span>
            </div>
          </div>

          {/* Client Notification Controls */}
          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Browser Push Notifications</p>
                <p className="text-[9px] text-slate-500">Display OS banner notifications on transaction</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="rounded border border-white/10 px-2 py-1 text-[8px] font-medium text-slate-400 hover:text-white"
                >
                  Prompt
                </button>
                <input
                  type="checkbox"
                  checked={browserNotifs}
                  onChange={(e) => setBrowserNotifs(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5">
              <div>
                <p className="text-xs font-semibold text-white">Synthesized Audio Chime</p>
                <p className="text-[9px] text-slate-500">Play two-tone alert via Web Audio API</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="rounded border border-white/10 px-2 py-1 text-[8px] font-medium text-slate-400 hover:text-white"
                >
                  Test Audio
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setIsAlertSettingsOpen(false)}
              className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

