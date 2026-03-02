import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import type { QuoteDto } from '@market-scanner/shared-types';

const REFRESH_INTERVAL = 60_000; // 60 seconds

export function useQuotes(symbols: string[]) {
  const [data, setData] = useState<QuoteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get<QuoteDto[]>('/api/market/quotes', {
        params: { symbols: symbols.join(',') },
      });
      setData(resp.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  return { data, loading, error, lastUpdated, refetch: fetchQuotes };
}
