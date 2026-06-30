# Changelog

All notable changes to this project are documented here.

## [1.0.1] - 2026-06-30

### Added
- **Quant analysis engine** powering the Market & Trading tabs — a composite,
  risk-adjusted signal blending momentum, trend, RSI mean-reversion, and a
  Sharpe-based risk adjustment. Implemented in both `backend/backend/app/quant_analysis.py`
  and `frontend/src/lib/quant.ts`.
- New backend market-intelligence API: `/api/market/quotes`, `/api/market/history/{ticker}`,
  `/api/market/analyst/{ticker}`, and `/api/trading/signal/{ticker}`.

### Fixed
- **Market Intelligence no longer shows a connection error.** The Market and
  Trading tabs now degrade gracefully to the quant engine on deterministic
  demo data whenever the live backend feed is unreachable, so the view always
  renders real analysis.

### Changed
- README documents the quant engine, the market-intelligence API, and the
  always-on demo mode.

## [1.0.0]

### Changed
- Migrated the AI news/analysis pipeline from OpenAI to Anthropic Claude
  (`claude-opus-4-8`) and reoriented the LLM analysis toward quantitative
  market intelligence (tickers, market sentiment, impact magnitude, daily
  Quant Market Pulse).
- Added MIT license, `.env.example`, and project documentation.
