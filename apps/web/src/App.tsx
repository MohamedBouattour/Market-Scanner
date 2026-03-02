import React from 'react';
import { useQuotes } from './hooks/useQuotes';

const ESN_SYMBOLS = ['CAP.PA', 'SOP.PA', 'ATE.PA', 'BNP.PA', 'OR.PA'];

function formatChange(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatPrice(value: number) {
  return value.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(value: number | null) {
  if (value === null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export default function App() {
  const { data, loading, error, lastUpdated, refetch } = useQuotes(ESN_SYMBOLS);

  return (
    <div className="container">
      <h1>📈 ESN Market Scanner</h1>

      <div className="status-bar">
        {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()} · </span>}
        <span>Auto-refresh every 60s · </span>
        <button
          onClick={refetch}
          disabled={loading}
          style={{ background: 'none', border: 'none', color: '#63b3ed', cursor: 'pointer', fontSize: 'inherit' }}
        >
          {loading ? 'Refreshing…' : '⟳ Refresh now'}
        </button>
      </div>

      {error && <div className="error">⚠ {error}</div>}

      {loading && !data.length ? (
        <div className="loading">Loading market data…</div>
      ) : (
        <table className="market-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price (€)</th>
              <th>% Change</th>
              <th>Volume</th>
              <th>Last Trade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((q) => (
              <tr key={q.symbol}>
                <td className="symbol">{q.symbol}</td>
                <td>{formatPrice(q.price)}</td>
                <td className={q.changePercent >= 0 ? 'positive' : 'negative'}>
                  {formatChange(q.changePercent)}
                </td>
                <td>{formatVolume(q.volume)}</td>
                <td>{q.datetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
