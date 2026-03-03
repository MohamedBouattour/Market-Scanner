import {
  Controller,
  Get,
  Query,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { MarketService } from "./market.service";
import { QuoteDto, EsnDto } from "@market-scanner/shared-types";

@Controller("market")
export class MarketController {
  constructor(private readonly market: MarketService) {}

  /**
   * GET /market/esn
   */
  @Get("esn")
  getEsnList(): Promise<EsnDto[]> {
    return this.market.getEsnList();
  }

  /**
   * GET /market/quotes?symbols=CAP.PA,SOP.PA,ATE.PA
   */
  @Get("quotes")
  getQuotes(@Query("symbols") symbols: string): Promise<QuoteDto[]> {
    if (!symbols) {
      throw new BadRequestException("symbols query param is required");
    }
    const list = symbols
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return this.market.getBatch(list);
  }

  /**
   * GET /market/quote?symbol=CAP.PA
   */
  @Get("quote")
  getSingle(@Query("symbol") symbol: string): Promise<QuoteDto> {
    if (!symbol) {
      throw new BadRequestException("symbol query param is required");
    }
    return this.market.getQuote(symbol.trim());
  }

  @Post("refresh-esn")
  async refreshEsn() {
    console.log("[Controller] Manually triggering ESN data refresh...");
    await this.market.handleWeeklyRefresh();
    return { status: "success", message: "ESN data refresh completed" };
  }
}
