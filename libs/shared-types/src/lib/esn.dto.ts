export interface EsnDto {
  symbol: string;
  name: string;
  headquarters: string;
  employees: number;
  marketGrowth: number;
  marketCap: number;
  sector: string;
  stockData: {
    price: number;
    change1d: number;
    change1m: number;
    change3m: number;
    change1y: number;
    lastUpdated: string;
  };
  news: Array<{
    title: string;
    source: string;
    date: string;
    url: string;
  }>;
}
