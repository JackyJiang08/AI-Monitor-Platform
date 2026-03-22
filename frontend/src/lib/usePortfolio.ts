import { useState, useEffect } from 'react';

// Define the base API URL (default to localhost:8000 where the FastAPI backend runs)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PortfolioData {
  id: string;
  name: string;
  stock_portfolio_value?: number;
  crypto_portfolio_value?: number;
  total_value?: number;
  // Add other relevant fields returned by the LiveTradeBench API
  [key: string]: any;
}

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // LiveTradeBench exposes agent portfolio data under /api/models
      const res = await fetch(`${API_BASE_URL}/api/models`);
      if (!res.ok) {
        throw new Error(`Failed to fetch portfolio data: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setPortfolios(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching portfolio data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
    // Optional: Set up a polling interval
    const interval = setInterval(fetchPortfolios, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  return { portfolios, isLoading, error, refetch: fetchPortfolios };
}
