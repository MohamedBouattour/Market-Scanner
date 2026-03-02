import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { QuoteDto } from '@market-scanner/shared-types';

const BASE_URL = 'https://api.twelvedata.com';

@Injectable()
export class MarketService {
  private readonly apiKey = process.env.TWELVE_DATA_API_KEY;

  async getQuote(symbol: string): Promise<QuoteDto> {
    if (!this.apiKey) {
      throw new HttpException(
        'TWELVE_DATA_API_KEY is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const { data } = await axios.get(`${BASE_URL}/quote`, {
        params: { symbol, apikey: this.apiKey },
      });

      if (data.code) {
        throw new HttpException(
          `Twelve Data error: ${data.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return {
        symbol: data.symbol,
        price: parseFloat(data.close ?? data.price),
        changePercent: parseFloat(data.percent_change),
        volume: data.volume ? Number(data.volume) : null,
        datetime: data.datetime,
      };
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        `Failed to fetch quote for ${symbol}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getBatch(symbols: string[]): Promise<QuoteDto[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }
}
