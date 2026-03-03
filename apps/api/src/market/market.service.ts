import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import { QuoteDto, EsnDto } from "@market-scanner/shared-types";
import * as fs from "fs/promises";
import * as path from "path";
import { GeminiService } from "./gemini.service";

const BASE_URL = "https://api.twelvedata.com";

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly apiKey = process.env["TWELVE_DATA_API_KEY"];

  constructor(private readonly geminiService: GeminiService) {}

  private readonly cache = new Map<
    string,
    { data: QuoteDto; timestamp: number }
  >();
  private readonly inProgress = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = 1_200_000; // 20 minutes
  private readonly CACHE_FILE = path.join(
    process.cwd(),
    "apps",
    "api",
    "src",
    "assets",
    "quotes_cache.json",
  );
  private readonly ESN_FILE = path.join(
    process.cwd(),
    "apps",
    "api",
    "src",
    "assets",
    "esn_data.json",
  );
  private lastFileLoad = 0;

  async onModuleInit() {
    await this.loadCache();
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async handleWeeklyRefresh() {
    console.log("[Scheduler] Running weekly ESN data refresh via Gemini...");
    try {
      const data = await fs.readFile(this.ESN_FILE, "utf-8");
      const esns: EsnDto[] = JSON.parse(data);

      const refreshPromises = esns.map(async (esn) => {
        console.log(`[Gemini] Triggering refresh for ${esn.symbol}...`);
        try {
          const refreshed = await this.geminiService.refreshEsnData(
            esn.symbol,
            esn,
          );
          return refreshed || esn;
        } catch (e) {
          console.error(`[Gemini] Refresh error for ${esn.symbol}:`, e);
          return esn;
        }
      });

      const updatedEsns = await Promise.all(refreshPromises);

      await fs.writeFile(this.ESN_FILE, JSON.stringify(updatedEsns, null, 2));
      console.log("[Scheduler] Weekly refresh completed successfully.");
    } catch (err) {
      console.error("[Scheduler] Weekly refresh failed:", err);
    }
  }

  private async loadCache() {
    try {
      const data = await fs.readFile(this.CACHE_FILE, "utf-8");
      const entries = JSON.parse(data);
      const now = Date.now();
      let count = 0;
      for (const [key, value] of entries) {
        // Only load if newer than current in-memory or if not exists
        const existing = this.cache.get(key);
        if (!existing || value.timestamp > existing.timestamp) {
          if (now - value.timestamp < this.CACHE_TTL) {
            this.cache.set(key, value);
            count++;
          }
        }
      }
      if (count > 0)
        console.log(`Synced ${count} new items from persistent cache.`);
      this.lastFileLoad = now;
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }

  private async saveCache() {
    try {
      // Only save non-expired items
      const now = Date.now();
      const entries = Array.from(this.cache.entries()).filter(
        ([_, value]) => now - value.timestamp < this.CACHE_TTL,
      );
      await fs.writeFile(this.CACHE_FILE, JSON.stringify(entries, null, 2));
    } catch (err) {
      console.error("Failed to save persistent cache:", err);
    }
  }

  async getEsnList(): Promise<EsnDto[]> {
    try {
      const data = await fs.readFile(this.ESN_FILE, "utf-8");
      const esns: EsnDto[] = JSON.parse(data);

      // Refresh ACN if possible (US symbol supported by free plan)
      try {
        const quotes = await this.getBatch(["ACN"]);
        const acn = esns.find((e) => e.symbol === "ACN");
        if (acn && quotes.length > 0) {
          acn.stockData.price = quotes[0].price;
          acn.stockData.change1d = quotes[0].changePercent;
          acn.stockData.lastUpdated = quotes[0].datetime;
        }
      } catch (e) {
        // Fallback to static values in JSON
      }

      return esns;
    } catch (err) {
      console.error("Failed to load ESN data:", err);
      return [];
    }
  }

  async getQuote(symbol: string): Promise<QuoteDto> {
    const quotes = await this.getBatch([symbol]);
    if (!quotes.length) {
      throw new HttpException(
        `Failed to fetch quote for ${symbol}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return quotes[0];
  }

  async getBatch(symbols: string[]): Promise<QuoteDto[]> {
    if (!this.apiKey) {
      throw new HttpException(
        "TWELVE_DATA_API_KEY is not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!symbols.length) return [];

    // Sync from file if needed
    if (Date.now() - this.lastFileLoad > 10_000) {
      await this.loadCache();
    }

    // Filter out cached symbols
    const now = Date.now();
    const result: QuoteDto[] = [];
    const missingSymbols: string[] = [];

    for (const s of symbols) {
      const entry = this.cache.get(s);
      if (entry && now - entry.timestamp < this.CACHE_TTL) {
        result.push(entry.data);
      } else {
        missingSymbols.push(s);
      }
    }

    if (missingSymbols.length === 0) {
      console.log(`Returning cached data for: ${symbols.join(",")}`);
      return result;
    }

    // Check for in-progress request for these exact symbols (batch ID)
    const batchId = missingSymbols.sort().join(",");
    if (this.inProgress.has(batchId)) {
      console.log(`Waiting for existing request for: ${batchId}`);
      await this.inProgress.get(batchId);
      return this.getBatch(symbols); // Recurse to return from cache
    }

    const fetchPromise = (async () => {
      try {
        console.log(`Fetching from Twelve Data: ${missingSymbols.join(",")}`);
        const { data } = await axios.get(`${BASE_URL}/quote`, {
          params: { symbol: missingSymbols.join(","), apikey: this.apiKey },
        });

        // Handle single symbol or error response
        if (data.code && data.code !== 200) {
          throw new HttpException(
            `Twelve Data error: ${data.message}`,
            HttpStatus.BAD_GATEWAY,
          );
        }

        // Collect new data
        const newData: QuoteDto[] = [];
        const errors: string[] = [];

        if (missingSymbols.length === 1 && data.symbol) {
          newData.push(this.mapToDto(data));
        } else if (missingSymbols.length === 1 && data.status === "error") {
          errors.push(data.message);
        } else {
          for (const s of missingSymbols) {
            const quoteData = data[s];
            if (quoteData && quoteData.status !== "error") {
              newData.push(this.mapToDto(quoteData));
            } else if (quoteData?.status === "error") {
              errors.push(`${s}: ${quoteData.message}`);
            }
          }
        }

        if (newData.length === 0 && errors.length > 0) {
          throw new HttpException(
            `Twelve Data errors: ${errors.join("; ")}`,
            HttpStatus.BAD_GATEWAY,
          );
        }

        // Update cache
        for (const item of newData) {
          this.cache.set(item.symbol, { data: item, timestamp: Date.now() });
        }
        await this.saveCache();
      } finally {
        this.inProgress.delete(batchId);
      }
    })();

    this.inProgress.set(batchId, fetchPromise);
    await fetchPromise;

    // After fetching, merge results from cache (since it's now updated)
    return this.getBatch(symbols);
  }

  private mapToDto(data: any): QuoteDto {
    return {
      symbol: data.symbol,
      price: parseFloat(data.close ?? data.price ?? "0"),
      changePercent: parseFloat(data.percent_change ?? "0"),
      volume: data.volume ? Number(data.volume) : null,
      datetime: data.datetime,
    };
  }
}
