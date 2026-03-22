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

export async function fetchPortfolio(): Promise<PortfolioData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/portfolio`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch portfolio data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error fetching portfolio:', err.message);
    throw err;
  }
}

export async function executeOrder(ticker: string, action: 'buy' | 'sell', shares: number): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker, action, shares }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.detail || `Failed to execute order: ${res.status}`);
    }
    
    return data;
  } catch (err: any) {
    console.error('Error executing order:', err.message);
    throw err;
  }
}

export async function fetchTradingSignal(ticker: string): Promise<{ signal: string, reason: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/signal/${ticker}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch signal for ${ticker}: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Error fetching trading signal:', err.message);
    throw err;
  }
}

export async function toggleAutoTrade(enabled: boolean): Promise<{ enabled: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/auto/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to toggle auto trade: ${res.status}`);
    }
    
    return await res.json();
  } catch (err: any) {
    console.error('Error toggling auto trade:', err.message);
    throw err;
  }
}

export async function fetchAutoTradeStatus(): Promise<{ enabled: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trading/auto/status`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch auto trade status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Error fetching auto trade status:', err.message);
    throw err;
  }
}
