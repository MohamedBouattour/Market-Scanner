export interface QuoteDto {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number | null;
  datetime: string;
}
