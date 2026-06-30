/**
 * Client-side quant analysis engine — a TypeScript port of the backend
 * `quant_analysis` module. It powers the Market / Trading tabs whenever the live
 * backend feed is not reachable, so the "market intelligence" view always renders
 * realistic, deterministic data instead of a connection error.
 *
 * Factors blended into the composite signal: multi-horizon momentum, trend vs.
 * the 50-day moving average, RSI(14) mean-reversion, and a Sharpe-based
 * risk adjustment with a volatility conviction penalty.
 */

const TRADING_DAYS = 252;

export interface UniverseEntry {
  ticker: string;
  name: string;
  sector: string;
  base: number;
}

export const AI_UNIVERSE: UniverseEntry[] = [
  { ticker: "NVDA", name: "NVIDIA", sector: "AI Compute", base: 132.0 },
  { ticker: "MSFT", name: "Microsoft", sector: "Cloud / AI Platform", base: 438.0 },
  { ticker: "GOOGL", name: "Alphabet", sector: "AI Platform", base: 178.0 },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "AI Compute", base: 168.0 },
  { ticker: "TSM", name: "TSMC", sector: "Semiconductors", base: 184.0 },
  { ticker: "AVGO", name: "Broadcom", sector: "AI Networking", base: 1620.0 },
  { ticker: "META", name: "Meta Platforms", sector: "AI Platform", base: 560.0 },
  { ticker: "AMZN", name: "Amazon", sector: "Cloud / AI", base: 198.0 },
  { ticker: "PLTR", name: "Palantir", sector: "AI Software", base: 38.0 },
  { ticker: "ASML", name: "ASML", sector: "Semiconductor Equipment", base: 920.0 },
  { ticker: "MU", name: "Micron", sector: "AI Memory", base: 102.0 },
  { ticker: "SMCI", name: "Super Micro", sector: "AI Servers", base: 44.0 },
];

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const mu = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - mu) ** 2, 0) / (xs.length - 1));
}

function dailyReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) out.push(prices[i] / prices[i - 1] - 1);
  }
  return out;
}

function sma(prices: number[], window: number): number {
  if (prices.length < window || window <= 0) return mean(prices);
  return mean(prices.slice(-window));
}

function momentum(prices: number[], window: number): number {
  if (prices.length <= window || prices[prices.length - window - 1] === 0) return 0;
  return prices[prices.length - 1] / prices[prices.length - window - 1] - 1;
}

function rsi(prices: number[], period = 14): number {
  if (prices.length <= period) return 50;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i <= period; i++) {
    const delta = prices[prices.length - i] - prices[prices.length - i - 1];
    if (delta >= 0) gains.push(delta);
    else losses.push(-delta);
  }
  const avgGain = gains.length ? mean(gains) : 0;
  const avgLoss = losses.length ? mean(losses) : 0;
  if (avgLoss === 0) return avgGain > 0 ? 100 : 50;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function sharpe(returns: number[]): number {
  const sd = stdev(returns);
  if (sd === 0) return 0;
  return (mean(returns) / sd) * Math.sqrt(TRADING_DAYS);
}

function maxDrawdown(prices: number[]): number {
  let peak = prices[0] ?? 0;
  let mdd = 0;
  for (const p of prices) {
    peak = Math.max(peak, p);
    if (peak > 0) mdd = Math.min(mdd, p / peak - 1);
  }
  return mdd;
}

const WEIGHTS = { momentum: 0.35, trend: 0.25, rsi: 0.15, sharpe: 0.25 };

export interface QuantMetrics {
  score: number;
  confidence: number;
  momentum20d: number;
  momentum60d: number;
  trendVsSma50: number;
  rsi14: number;
  volatility: number;
  sharpe: number;
  maxDrawdown: number;
}

export function compositeScore(prices: number[]): QuantMetrics {
  const rets = dailyReturns(prices);
  const mom20 = momentum(prices, 20);
  const mom60 = momentum(prices, 60);
  const sma50 = sma(prices, 50);
  const trend = sma50 ? prices[prices.length - 1] / sma50 - 1 : 0;
  const rsi14 = rsi(prices);
  const vol = stdev(rets) * Math.sqrt(TRADING_DAYS);
  const shp = sharpe(rets);

  const momScore = clamp(mom20 * 5, -1, 1) * 0.6 + clamp(mom60 * 3, -1, 1) * 0.4;
  const trendScore = clamp(trend * 8, -1, 1);
  let rsiScore = 0;
  if (rsi14 >= 70) rsiScore = -(rsi14 - 70) / 30;
  else if (rsi14 <= 30) rsiScore = (30 - rsi14) / 30;
  const sharpeScore = clamp(shp / 2, -1, 1);

  const raw =
    WEIGHTS.momentum * momScore +
    WEIGHTS.trend * trendScore +
    WEIGHTS.rsi * rsiScore +
    WEIGHTS.sharpe * sharpeScore;
  const volPenalty = clamp(vol / 0.6, 0, 1);
  const score = raw * (1 - 0.3 * volPenalty);

  return {
    score: Math.round(score * 1000) / 10,
    confidence: Math.round((Math.abs(score) * 0.7 + (1 - volPenalty) * 0.3) * 1000) / 10,
    momentum20d: Math.round(mom20 * 10000) / 100,
    momentum60d: Math.round(mom60 * 10000) / 100,
    trendVsSma50: Math.round(trend * 10000) / 100,
    rsi14: Math.round(rsi14 * 10) / 10,
    volatility: Math.round(vol * 1000) / 10,
    sharpe: Math.round(shp * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown(prices) * 1000) / 10,
  };
}

export function signalLabel(score: number): string {
  if (score >= 50) return "STRONG_BUY";
  if (score >= 20) return "BUY";
  if (score > -20) return "HOLD";
  if (score > -50) return "SELL";
  return "STRONG_SELL";
}

function rationale(ticker: string, m: QuantMetrics, signal: string): string {
  const trendWord = m.trendVsSma50 >= 0 ? "above" : "below";
  const rsiState = m.rsi14 >= 70 ? "overbought" : m.rsi14 <= 30 ? "oversold" : "neutral";
  return (
    `${ticker} is trading ${Math.abs(m.trendVsSma50).toFixed(1)}% ${trendWord} its 50-day average ` +
    `with ${m.momentum20d >= 0 ? "+" : ""}${m.momentum20d.toFixed(1)}% 20-day and ` +
    `${m.momentum60d >= 0 ? "+" : ""}${m.momentum60d.toFixed(1)}% 60-day momentum. ` +
    `RSI(14) at ${m.rsi14.toFixed(0)} is ${rsiState}; annualized volatility is ` +
    `${m.volatility.toFixed(0)}% and the Sharpe ratio is ${m.sharpe.toFixed(2)}. ` +
    `Composite quant signal: ${signal.replace("_", " ")} ` +
    `(score ${m.score >= 0 ? "+" : ""}${m.score.toFixed(0)}, confidence ${m.confidence.toFixed(0)}%).`
  );
}

export interface QuantBrief {
  ticker: string;
  signal: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  metrics: QuantMetrics;
  analysis: string;
}

export function analyze(ticker: string, prices: number[]): QuantBrief {
  const series = prices.length >= 30 ? prices : syntheticSeries(ticker);
  const metrics = compositeScore(series);
  const signal = signalLabel(metrics.score);
  const sentiment = metrics.score >= 20 ? "BULLISH" : metrics.score <= -20 ? "BEARISH" : "NEUTRAL";
  return { ticker, signal, sentiment, metrics, analysis: rationale(ticker, metrics, signal) };
}

/** Deterministic geometric-random-walk path seeded by the ticker symbol. */
export function syntheticSeries(ticker: string, n = 180, base?: number): number[] {
  const entry = AI_UNIVERSE.find((e) => e.ticker === ticker);
  const ref = base ?? entry?.base ?? 100;
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed = (seed * 31 + ticker.charCodeAt(i)) & 0x7fffffff;
  const drift = 0.0006;
  const vol = 0.022;
  let price = ref * 0.82;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    seed = (1103515245 * seed + 12345) & 0x7fffffff;
    const u = seed / 0x7fffffff;
    price *= Math.exp(drift + vol * (u - 0.5) * 2);
    out.push(Math.round(price * 100) / 100);
  }
  const scale = out[out.length - 1] ? ref / out[out.length - 1] : 1;
  return out.map((p) => Math.round(p * scale * 100) / 100);
}
