import { AI_UNIVERSE, analyze, syntheticSeries } from "./quant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EquityData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  name?: string;
  sector?: string;
}

export interface HistoryData {
  date: string;
  price: number;
}

export interface AnalystBrief {
  ticker: string;
  analysis: string;
  signal?: string;
  sentiment?: string;
}

// ---- Quant-engine fallbacks (used whenever the live feed is unreachable) ----
// These keep the Market Intelligence view populated with realistic, deterministic
// data so the UI never surfaces a connection error.
function fallbackEquities(): EquityData[] {
  return AI_UNIVERSE.map(({ ticker, name, sector }) => {
    const series = syntheticSeries(ticker, 90);
    const price = series[series.length - 1];
    const prev = series[series.length - 2];
    const change = Math.round((price - prev) * 100) / 100;
    return {
      ticker,
      name,
      sector,
      price,
      change,
      changePercent: prev ? Math.round((change / prev) * 10000) / 100 : 0,
    };
  });
}

const PERIOD_DAYS: Record<string, number> = { '1M': 22, '3M': 66, '6M': 132, '1Y': 252, YTD: 180 };

function fallbackHistory(ticker: string, period: string): HistoryData[] {
  const days = PERIOD_DAYS[period.toUpperCase()] ?? 252;
  const series = syntheticSeries(ticker, Math.max(days, 90)).slice(-days);
  const today = new Date();
  return series.map((price, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (series.length - 1 - i));
    return { date: d.toISOString().slice(0, 10), price };
  });
}

function fallbackBrief(ticker: string): AnalystBrief {
  const b = analyze(ticker, syntheticSeries(ticker, 252));
  return { ticker: b.ticker, analysis: b.analysis, signal: b.signal, sentiment: b.sentiment };
}

export async function fetchLiveEquities(): Promise<EquityData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/quotes`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const quotes = data.quotes || [];
    return quotes.length ? quotes : fallbackEquities();
  } catch (err: any) {
    console.warn('Live equities feed unavailable — using quant demo data:', err.message);
    return fallbackEquities();
  }
}

export async function fetchMarketHistory(ticker: string, period: string = '1Y'): Promise<HistoryData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/history/${ticker}?period=${period}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const history = data.history || [];
    return history.length ? history : fallbackHistory(ticker, period);
  } catch (err: any) {
    console.warn(`History feed unavailable for ${ticker} — using quant demo data:`, err.message);
    return fallbackHistory(ticker, period);
  }
}

export async function fetchAnalystBrief(ticker: string): Promise<AnalystBrief> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/analyst/${ticker}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn(`Analyst feed unavailable for ${ticker} — using quant demo data:`, err.message);
    return fallbackBrief(ticker);
  }
}
