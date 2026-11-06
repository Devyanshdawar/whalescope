import type { IconName } from "../components/ui/Icon";

export const walletData = [
  {
    rank: 1,
    address: "0x71C8F4A296E37B1234F89D5123A7C921",
    alias: "Jump Trading",
    pnl: 42.8,
    winRate: 91.2,
    token: "ETH",
    tokenColor: "#627EEA",
    tracked: true,
  },
  {
    rank: 2,
    address: "0xA38D9271BC008F52E6650145C93A88D4",
    alias: "Wintermute",
    pnl: 36.4,
    winRate: 87.5,
    token: "WBTC",
    tokenColor: "#F7931A",
    tracked: false,
  },
  {
    rank: 3,
    address: "0x9F47A62DB823F5983512B4AA0679E815",
    alias: "Amber Group",
    pnl: 29.1,
    winRate: 84.8,
    token: "SOL",
    tokenColor: "#9945FF",
    tracked: true,
  },
  {
    rank: 4,
    address: "0xD42C5816BA7287E15C42F65093F6F5B0",
    alias: "Smart LP 0xD4",
    pnl: 24.7,
    winRate: 82.1,
    token: "LINK",
    tokenColor: "#2A5ADA",
    tracked: false,
  },
  {
    rank: 5,
    address: "0x3B91F0C47618D9E4027A6A85C17EA21B",
    alias: "Alpha Seeker",
    pnl: 18.2,
    winRate: 79.6,
    token: "AAVE",
    tokenColor: "#B6509E",
    tracked: false,
  },
  {
    rank: 6,
    address: "0xE9174A62D028C18BFF61D76074A80513",
    alias: "Fund 0xE9",
    pnl: -3.6,
    winRate: 72.3,
    token: "ENA",
    tokenColor: "#E7E8EA",
    tracked: true,
  },
];

export const transactions = [
  { wallet: "0x71C...A921", action: "swapped 500 ETH for USDC", value: "$1.31M", time: "2m ago" },
  { wallet: "0x3B9...A21B", action: "accumulated 82.4 WBTC", value: "$5.24M", time: "4m ago" },
  { wallet: "0xA38...88D4", action: "deposited into Aave V3", value: "$3.89M", time: "7m ago" },
  { wallet: "0x9F4...9E81", action: "bought 18,420 SOL", value: "$2.76M", time: "11m ago" },
];

export const trendingTokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$2,628.14",
    change: "+8.4%",
    flow: "$42.8M",
    color: "#627EEA",
    share: 92,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$148.32",
    change: "+12.6%",
    flow: "$31.2M",
    color: "#9945FF",
    share: 73,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: "$14.81",
    change: "+5.1%",
    flow: "$18.7M",
    color: "#2A5ADA",
    share: 51,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    price: "$112.09",
    change: "+3.8%",
    flow: "$9.6M",
    color: "#B6509E",
    share: 32,
  },
];

export const notificationData = [
  {
    id: 1,
    title: "Whale accumulation detected",
    text: "0x71C...A921 bought 500 ETH",
    value: "$1.31M",
    time: "Just now",
    color: "cyan",
  },
  {
    id: 2,
    title: "Smart money movement",
    text: "Wintermute moved 1.2M USDC",
    value: "$1.20M",
    time: "3m",
    color: "blue",
  },
  {
    id: 3,
    title: "Large swap executed",
    text: "0x9F4...9E81 swapped into SOL",
    value: "$876K",
    time: "8m",
    color: "green",
  },
];

export const navItems: { label: string; icon: IconName }[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Watchlist", icon: "watchlist" },
  { label: "Live Alerts", icon: "bell" },
  { label: "Pricing Tier", icon: "pricing" },
  { label: "Settings", icon: "settings" },
];
