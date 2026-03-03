import React, { useState } from 'react';
import { useEsnMarket } from './hooks/useEsnMarket';
import type { EsnDto } from '@market-scanner/shared-types';

type Timeframe = '1d' | '1m' | '3m' | '1y';

export default function App() {
  const { esns, loading, error, refetch } = useEsnMarket();
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');

  function formatChange(value: number) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  function formatPrice(value: number) {
    return value.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatValue(val: number) {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  }

  const getTimeframeChange = (esn: EsnDto) => {
    switch (timeframe) {
      case '1d': return esn.stockData.change1d;
      case '1m': return esn.stockData.change1m;
      case '3m': return esn.stockData.change3m;
      case '1y': return esn.stockData.change1y;
      default: return 0;
    }
  };

  return (
    <div className="container dashboard">
      <header className="main-header">
        <div className="title-group">
          <h1>🚀 Tech Europe Index</h1>
          <p className="subtitle">Observing the ESN Ecosystem around Europe & France</p>
        </div>
        <div className="actions">
          <div className="timeframe-picker">
            {(['1d', '1m', '3m', '1y'] as const).map((t) => (
              <button
                key={t}
                className={timeframe === t ? 'active' : ''}
                onClick={() => setTimeframe(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="sync-btn" disabled={loading} onClick={refetch}>
            {loading ? 'Syncing...' : '↻ SYNC'}
          </button>
        </div>
      </header>

      {error && <div className="error-alert">⚠ {error}</div>}

      <div className="grid">
        {esns.map((esn) => {
          const change = getTimeframeChange(esn);
          return (
            <div key={esn.symbol} className="esn-card">
              <div className="card-top">
                <div className="esn-info">
                  <h2 className="esn-name">{esn.name}</h2>
                  <span className="esn-sector">{esn.sector}</span>
                </div>
                <div className={`esn-trend ${change >= 0 ? 'bull' : 'bear'}`}>
                  {formatChange(change)}
                </div>
              </div>

              <div className="price-primary">
                <span className="currency">€</span>
                <span className="price-value">{formatPrice(esn.stockData.price)}</span>
              </div>

              <div className="enterprise-stats">
                <div className="stat-item">
                  <label>Employees</label>
                  <span>{formatValue(esn.employees)}</span>
                </div>
                <div className="stat-item">
                  <label>Market Cap</label>
                  <span>€{formatValue(esn.marketCap)}</span>
                </div>
                <div className="stat-item">
                  <label>Growth</label>
                  <span className={esn.marketGrowth >= 0 ? 'positive' : 'negative'}>
                    {esn.marketGrowth > 0 ? '+' : ''}{esn.marketGrowth}%
                  </span>
                </div>
              </div>

              <div className="news-feed">
                <h3>Latest Insights</h3>
                <ul>
                  {esn.news.map((n, idx) => (
                    <li key={idx}>
                      <a href={n.url} target="_blank" rel="noreferrer">
                        <span className="news-title">{n.title}</span>
                        <div className="news-meta">
                          <span className="news-src">{n.source}</span>
                          <span className="news-date">{n.date}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="dashboard-footer">
        <p>Market growth and stats provided for observation purposes. Data may be delayed by several cycles.</p>
        <div className="footer-links">
          <span>Tech Newsletter v2.1</span>
          <span>•</span>
          <span>France IT Services</span>
        </div>
      </footer>
    </div>
  );
}
