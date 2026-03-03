import { Module } from "@nestjs/common";
import { MarketController } from "./market.controller";
import { MarketService } from "./market.service";
import { GeminiService } from "./gemini.service";

@Module({
  controllers: [MarketController],
  providers: [MarketService, GeminiService],
})
export class MarketModule {}
