import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { EsnDto } from "@market-scanner/shared-types";

export function useEsnMarket() {
  const [esns, setEsns] = useState<EsnDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEsns = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get<EsnDto[]>("/api/market/esn");
      setEsns(resp.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load ESN market data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEsns();
  }, [fetchEsns]);

  return { esns, loading, error, refetch: fetchEsns };
}
