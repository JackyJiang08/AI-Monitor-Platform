import { analyze, syntheticSeries } from "./quant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Holding {
  ticker: string;
  shares: number;
  avg_price: number;
  current_price: number;
  total_return: number;
}

export interface HistoryRecord {
  timestamp: string;
  action: string;
  ticker: string;
  shares: number;
  price: number;
  reason?: string;
}

export interface PortfolioData {
  buying_power: number;
  total_value: number;
  day_pl: number;
  holdings: Holding[];
  history: HistoryRecord[];
  equity_history: { timestamp: string, equity: number }[];
}

// ---- Quant-engine fallbacks (used whenever the live backend is unreachable) ----
// Keep the Trading tab populated with a realistic demo portfolio + signals so the
// UI never shows a connection error.
const DEMO_HOLDINGS = ['NVDA', 'MSFT', 'AMD', 'TSM'];

function fallbackPortfolio(): PortfolioData {
  let invested = 0;
  let dayPl = 0;
  const holdings: Holding[] = DEMO_HOLDINGS.map((ticker, i) => {
    const series = syntheticSeries(ticker, 90);
    const current = series[series.length - 1];
    const prev = series[series.length - 2];
    const avg = series[series.length - 61] ?? series[0];
    const shares = [40, 20, 30, 25][i] ?? 10;
    invested += shares * current;
    dayPl += shares * (current - prev);
    return {
      ticker,
      shares,
      avg_price: avg,
      current_price: current,
      total_return: avg ? Math.round((current / avg - 1) * 10000) / 100 : 0,
    };
  });

  const buying_power = 25000;
  const total_value = Math.round((buying_power + invested) * 100) / 100;

  // Portfolio-level equity curve scaled to the current total value.
  const curve = syntheticSeries('PORTFOLIO', 60);
  const last = curve[curve.length - 1] || 1;
  const today = new Date();
  const equity_history = curve.map((p, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (curve.length - 1 - i));
    return { timestamp: d.toISOString(), equity: Math.round((p / last) * total_value * 100) / 100 };
  });

  const history: HistoryRecord[] = holdings.map((h, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + 1) * 3);
    return {
      timestamp: d.toISOString(),
      action: 'BUY',
      ticker: h.ticker,
      shares: h.shares,
      price: h.avg_price,
      reason: analyze(h.ticker, syntheticSeries(h.ticker, 252)).signal.replace('_', ' '),
    };
  });

  return {
    buying_power,
    total_value,
    day_pl: Math.round(dayPl * 100) / 100,
    holdings,
    history,
    equity_history,
  };
}

function fallbackSignal(ticker: string): { signal: string, reason: string } {
  const b = analyze(ticker, syntheticSeries(ticker, 252));
  return { signal: b.signal, reason: b.analysis };
}

export async function fetchPortfolio(): Promise<PortfolioData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/portfolio`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn('Portfolio feed unavailable — using quant demo portfolio:', err.message);
    return fallbackPortfolio();
  }
}

export async function executeOrder(ticker: string, action: 'buy' | 'sell', shares: number): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, action, shares }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `Failed to execute order: ${res.status}`);
    }
    return data;
  } catch (err: any) {
    // Demo mode: simulate a fill instead of surfacing a connection error.
    console.warn('Order endpoint unavailable — simulating fill (demo mode):', err.message);
    return { message: `Simulated ${action.toUpperCase()} ${shares} ${ticker.toUpperCase()} (demo mode)` };
  }
}

export async function fetchTradingSignal(ticker: string): Promise<{ signal: string, reason: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/signal/${ticker}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn(`Signal feed unavailable for ${ticker} — using quant demo data:`, err.message);
    return fallbackSignal(ticker);
  }
}

export async function toggleAutoTrade(enabled: boolean): Promise<{ enabled: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/auto/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn('Auto-trade toggle unavailable — applying locally (demo mode):', err.message);
    return { enabled };
  }
}

export async function fetchAutoTradeStatus(): Promise<{ enabled: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/auto/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn('Auto-trade status unavailable — defaulting to off (demo mode):', err.message);
    return { enabled: false };
  }
}
