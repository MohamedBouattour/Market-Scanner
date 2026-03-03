import { Injectable } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EsnDto } from "@market-scanner/shared-types";

@Injectable()
export class GeminiService {
  private readonly genAI?: GoogleGenerativeAI;
  private readonly model?: any;

  constructor() {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
    } else {
      console.warn(
        "GEMINI_API_KEY is not set or has placeholder value. Gemini integration disabled.",
      );
    }
  }

  async refreshEsnData(
    symbol: string,
    currentData: Partial<EsnDto>,
  ): Promise<EsnDto | null> {
    if (!this.model) return null;

    const today = new Date().toISOString().split("T")[0]; // 2026-03-03
    const prompt = `
      Search and provide the LATEST enterprise data for the company "${currentData.name}" (symbol: "${symbol}") as of EARLY 2026. 
      Today's current date is ${today}.
      
      Look specifically for recent 2025 or 2026 news, financial reports, or major events. 
      Provide the response strictly as valid JSON matching this schema:
      {
        "symbol": string,
        "name": string,
        "headquarters": string,
        "employees": number, (provide the most recent count for 2025/2026 if available)
        "marketCap": number, (provide current market cap in USD/EUR if available, enter 0 for private companies)
        "sector": string,
        "news": [
          {
            "title": string,
            "source": string,
            "date": "YYYY-MM-DD",
            "url": string (A real URL from 2025 or 2026)
          }
        ]
      }
      Include 3 news items from major reputable sources (Reuters, Bloomberg, TechCrunch, WSJ, Les Echos, etc.) specifically from 2025 or 2026.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from potential markdown wrapping
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      const data = JSON.parse(jsonStr);

      // Merge with current data to preserve stock pricing from Twelve Data
      return {
        ...currentData,
        ...data,
        symbol: symbol, // Ensure symbol is preserved
        stockData: currentData.stockData, // Keep stock data as managed by Twelve Data
      } as EsnDto;
    } catch (err) {
      console.error(`Failed to refresh data for ${symbol}:`, err);
      return null;
    }
  }
}
