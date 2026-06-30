"""Quantitative analysis engine for the AI Monitor market-intelligence module.

A self-contained, dependency-free (pure-Python) quant toolkit that turns a raw
price series into an interpretable trading signal. It blends four classic,
complementary factors into a single risk-adjusted score:

    * Momentum        - multi-horizon trend persistence (20d / 60d)
    * Trend           - price position relative to its 50-day moving average
    * Mean-reversion  - RSI(14) contrarian pressure at overbought/oversold extremes
    * Risk-adjustment - annualized Sharpe ratio, with a volatility conviction penalty

The composite score (-100..+100) maps to a discrete signal with a confidence
score, plus a human-readable analyst rationale. Everything is deterministic and
offline-friendly so the endpoint never blocks on an external data feed.
"""

from __future__ import annotations

import hashlib
import math
from typing import Dict, List, Optional, Tuple

TRADING_DAYS = 252

# Curated AI-sector universe (ticker, company, sub-sector, reference price).
AI_UNIVERSE: List[Tuple[str, str, str, float]] = [
    ("NVDA", "NVIDIA", "AI Compute", 132.0),
    ("MSFT", "Microsoft", "Cloud / AI Platform", 438.0),
    ("GOOGL", "Alphabet", "AI Platform", 178.0),
    ("AMD", "Advanced Micro Devices", "AI Compute", 168.0),
    ("TSM", "TSMC", "Semiconductors", 184.0),
    ("AVGO", "Broadcom", "AI Networking", 1620.0),
    ("META", "Meta Platforms", "AI Platform", 560.0),
    ("AMZN", "Amazon", "Cloud / AI", 198.0),
    ("PLTR", "Palantir", "AI Software", 38.0),
    ("ASML", "ASML", "Semiconductor Equipment", 920.0),
    ("MU", "Micron", "AI Memory", 102.0),
    ("SMCI", "Super Micro", "AI Servers", 44.0),
]


# --------------------------------------------------------------------------- #
# Core indicators
# --------------------------------------------------------------------------- #
def daily_returns(prices: List[float]) -> List[float]:
    """Simple period-over-period returns."""
    return [
        (prices[i] / prices[i - 1]) - 1.0
        for i in range(1, len(prices))
        if prices[i - 1] != 0
    ]


def _mean(xs: List[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


def _stdev(xs: List[float]) -> float:
    if len(xs) < 2:
        return 0.0
    mu = _mean(xs)
    return math.sqrt(sum((x - mu) ** 2 for x in xs) / (len(xs) - 1))


def annualized_volatility(returns: List[float]) -> float:
    """Std of daily returns scaled to an annual figure."""
    return _stdev(returns) * math.sqrt(TRADING_DAYS)


def sharpe_ratio(returns: List[float], risk_free: float = 0.0) -> float:
    """Annualized Sharpe ratio (0 risk-free by default)."""
    sd = _stdev(returns)
    if sd == 0:
        return 0.0
    excess = _mean(returns) - (risk_free / TRADING_DAYS)
    return (excess / sd) * math.sqrt(TRADING_DAYS)


def sma(prices: List[float], window: int) -> float:
    """Simple moving average over the most recent `window` observations."""
    if len(prices) < window or window <= 0:
        return _mean(prices)
    return _mean(prices[-window:])


def momentum(prices: List[float], window: int) -> float:
    """Cumulative return over `window` periods."""
    if len(prices) <= window or prices[-window - 1] == 0:
        return 0.0
    return (prices[-1] / prices[-window - 1]) - 1.0


def rsi(prices: List[float], period: int = 14) -> float:
    """Wilder's Relative Strength Index."""
    if len(prices) <= period:
        return 50.0
    gains, losses = [], []
    for i in range(1, period + 1):
        delta = prices[-i] - prices[-i - 1]
        (gains if delta >= 0 else losses).append(abs(delta))
    avg_gain = _mean(gains) if gains else 0.0
    avg_loss = _mean(losses) if losses else 0.0
    if avg_loss == 0:
        return 100.0 if avg_gain > 0 else 50.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def max_drawdown(prices: List[float]) -> float:
    """Largest peak-to-trough decline as a negative fraction."""
    peak, mdd = prices[0] if prices else 0.0, 0.0
    for p in prices:
        peak = max(peak, p)
        if peak > 0:
            mdd = min(mdd, (p / peak) - 1.0)
    return mdd


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


# --------------------------------------------------------------------------- #
# Composite signal
# --------------------------------------------------------------------------- #
# Factor weights (sum to 1.0). Tuned so trend + momentum dominate, with
# mean-reversion and risk-adjustment acting as confirmation/veto factors.
_WEIGHTS = {"momentum": 0.35, "trend": 0.25, "rsi": 0.15, "sharpe": 0.25}


def composite_score(prices: List[float]) -> Dict[str, float]:
    """Blend the factors into a single score in [-100, 100] plus diagnostics."""
    rets = daily_returns(prices)
    mom_20, mom_60 = momentum(prices, 20), momentum(prices, 60)
    sma_50 = sma(prices, 50)
    trend = (prices[-1] / sma_50 - 1.0) if sma_50 else 0.0
    rsi_14 = rsi(prices)
    vol = annualized_volatility(rets)
    sharpe = sharpe_ratio(rets)

    # Map each factor to [-1, 1].
    mom_score = _clamp(mom_20 * 5, -1, 1) * 0.6 + _clamp(mom_60 * 3, -1, 1) * 0.4
    trend_score = _clamp(trend * 8, -1, 1)
    if rsi_14 >= 70:      # overbought -> contrarian bearish
        rsi_score = -(rsi_14 - 70) / 30.0
    elif rsi_14 <= 30:    # oversold -> contrarian bullish
        rsi_score = (30 - rsi_14) / 30.0
    else:
        rsi_score = 0.0
    sharpe_score = _clamp(sharpe / 2.0, -1, 1)

    raw = (
        _WEIGHTS["momentum"] * mom_score
        + _WEIGHTS["trend"] * trend_score
        + _WEIGHTS["rsi"] * rsi_score
        + _WEIGHTS["sharpe"] * sharpe_score
    )
    # High realized volatility dampens conviction (a 60% annual vol = full penalty).
    vol_penalty = _clamp(vol / 0.60, 0.0, 1.0)
    score = raw * (1.0 - 0.30 * vol_penalty)

    return {
        "score": round(score * 100, 1),
        "confidence": round((abs(score) * 0.7 + (1 - vol_penalty) * 0.3) * 100, 1),
        "momentum_20d": round(mom_20 * 100, 2),
        "momentum_60d": round(mom_60 * 100, 2),
        "trend_vs_sma50": round(trend * 100, 2),
        "rsi_14": round(rsi_14, 1),
        "volatility_annualized": round(vol * 100, 1),
        "sharpe_ratio": round(sharpe, 2),
        "max_drawdown": round(max_drawdown(prices) * 100, 1),
    }


def _signal_label(score: float) -> str:
    if score >= 50:
        return "STRONG_BUY"
    if score >= 20:
        return "BUY"
    if score > -20:
        return "HOLD"
    if score > -50:
        return "SELL"
    return "STRONG_SELL"


def _rationale(ticker: str, m: Dict[str, float], signal: str) -> str:
    trend_word = "above" if m["trend_vs_sma50"] >= 0 else "below"
    rsi_state = (
        "overbought" if m["rsi_14"] >= 70
        else "oversold" if m["rsi_14"] <= 30
        else "neutral"
    )
    return (
        f"{ticker} is trading {abs(m['trend_vs_sma50']):.1f}% {trend_word} its 50-day average "
        f"with {m['momentum_20d']:+.1f}% 20-day and {m['momentum_60d']:+.1f}% 60-day momentum. "
        f"RSI(14) at {m['rsi_14']:.0f} is {rsi_state}; annualized volatility is "
        f"{m['volatility_annualized']:.0f}% and the Sharpe ratio is {m['sharpe_ratio']:.2f}. "
        f"Composite quant signal: {signal.replace('_', ' ')} "
        f"(score {m['score']:+.0f}, confidence {m['confidence']:.0f}%)."
    )


def analyze(ticker: str, prices: List[float]) -> Dict[str, object]:
    """Full quant brief for one instrument."""
    if len(prices) < 30:
        prices = synthetic_series(ticker)
    metrics = composite_score(prices)
    signal = _signal_label(metrics["score"])
    sentiment = (
        "BULLISH" if metrics["score"] >= 20
        else "BEARISH" if metrics["score"] <= -20
        else "NEUTRAL"
    )
    return {
        "ticker": ticker,
        "signal": signal,
        "sentiment": sentiment,
        "metrics": metrics,
        "analysis": _rationale(ticker, metrics, signal),
    }


# --------------------------------------------------------------------------- #
# Deterministic synthetic price series (offline / fallback data feed)
# --------------------------------------------------------------------------- #
def _seed(ticker: str) -> int:
    return int(hashlib.sha256(ticker.encode()).hexdigest(), 16) % (2**32)


def synthetic_series(ticker: str, n: int = 180, base: Optional[float] = None) -> List[float]:
    """Reproducible geometric-random-walk path seeded by the ticker symbol.

    Used when no live market feed is configured so the quant engine and the UI
    always have realistic, deterministic data to work with.
    """
    if base is None:
        base = next((p for t, _, _, p in AI_UNIVERSE if t == ticker), 100.0)
    rng = _seed(ticker)
    drift, vol = 0.0006, 0.022  # mild positive drift, ~35% annualized vol
    price, out = base * 0.82, []
    for _ in range(n):
        rng = (1103515245 * rng + 12345) & 0x7FFFFFFF  # LCG -> uniform
        u = rng / 0x7FFFFFFF
        shock = (u - 0.5) * 2.0  # ~uniform[-1,1] as a cheap normal proxy
        price *= math.exp(drift + vol * shock)
        out.append(round(price, 2))
    # Anchor the final point near the reference price for a recognizable level.
    scale = base / out[-1] if out[-1] else 1.0
    return [round(p * scale, 2) for p in out]
