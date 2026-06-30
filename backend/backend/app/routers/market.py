"""Market-intelligence API powered by the quant analysis engine.

Serves the equity quotes, price history, and analyst briefs consumed by the
front-end Market and Trading tabs. Backed by the deterministic quant engine in
``quant_analysis`` so the endpoints are fast and never depend on an external
feed being reachable.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter

from .. import quant_analysis as quant

router = APIRouter()

_PERIOD_DAYS = {"1M": 22, "3M": 66, "6M": 132, "1Y": 252, "YTD": 180}


def _series_for(ticker: str, days: int) -> List[float]:
    return quant.synthetic_series(ticker, n=max(days, 90))


@router.get("/market/quotes")
def get_market_quotes() -> Dict[str, Any]:
    """Latest quote + intraday change for the AI-sector universe."""
    quotes = []
    for ticker, name, sector, _base in quant.AI_UNIVERSE:
        series = _series_for(ticker, 90)
        price, prev = series[-1], series[-2]
        change = round(price - prev, 2)
        quotes.append(
            {
                "ticker": ticker,
                "name": name,
                "sector": sector,
                "price": price,
                "change": change,
                "changePercent": round((change / prev) * 100, 2) if prev else 0.0,
            }
        )
    return {"quotes": quotes}


@router.get("/market/history/{ticker}")
def get_market_history(ticker: str, period: str = "1Y") -> Dict[str, Any]:
    """Daily close history for a ticker over the requested period."""
    ticker = ticker.upper()
    days = _PERIOD_DAYS.get(period.upper(), 252)
    series = _series_for(ticker, days)[-days:]
    today = datetime.utcnow().date()
    history = [
        {"date": (today - timedelta(days=len(series) - 1 - i)).isoformat(), "price": p}
        for i, p in enumerate(series)
    ]
    return {"ticker": ticker, "period": period, "history": history}


@router.get("/market/analyst/{ticker}")
def get_analyst_brief(ticker: str) -> Dict[str, Any]:
    """Quant analyst brief: signal, factor metrics, and a written rationale."""
    ticker = ticker.upper()
    brief = quant.analyze(ticker, _series_for(ticker, 252))
    return brief


@router.get("/trading/signal/{ticker}")
def get_trading_signal(ticker: str) -> Dict[str, Any]:
    """Discrete trading signal + reason for the Trading tab."""
    ticker = ticker.upper()
    brief = quant.analyze(ticker, _series_for(ticker, 252))
    return {
        "ticker": ticker,
        "signal": brief["signal"],
        "reason": brief["analysis"],
        "metrics": brief["metrics"],
    }
