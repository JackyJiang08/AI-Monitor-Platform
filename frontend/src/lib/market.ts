const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EquityData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface HistoryData {
  date: string;
  price: number;
}

export interface AnalystBrief {
  ticker: string;
  analysis: string;
}

export async function fetchLiveEquities(): Promise<EquityData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/quotes`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch equities data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.quotes || [];
  } catch (err: any) {
    console.error('Error fetching live equities:', err.message);
    throw err;
  }
}

export async function fetchMarketHistory(ticker: string, period: string = '1Y'): Promise<HistoryData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/history/${ticker}?period=${period}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch history data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.history || [];
  } catch (err: any) {
    console.error(`Error fetching history for ${ticker}:`, err.message);
    throw err;
  }
}

export async function fetchAnalystBrief(ticker: string): Promise<AnalystBrief> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/analyst/${ticker}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch analyst brief: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`Error fetching analyst brief for ${ticker}:`, err.message);
    throw err;
  }
}
