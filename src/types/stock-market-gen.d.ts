declare module "stock-market-gen" {
  export interface GeneratedMarketBar {
    readonly time: number;
    readonly date: string;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close: number;
    readonly volume: number;
  }

  export interface GeneratedStock {
    readonly symbol: string;
    readonly name: string | null;
    readonly sector: string | null;
    readonly kind: "stock" | "crypto";
    readonly startPrice: number;
    readonly interval: number;
    readonly bars: readonly GeneratedMarketBar[];
  }

  export interface GenerateStockOptions {
    readonly symbol?: string;
    readonly name?: string | null;
    readonly sector?: string | null;
    readonly startPrice?: number;
    readonly drift?: number;
    readonly volatility?: number;
    readonly bars?: number;
    readonly interval?: number | string;
    readonly startDate?: Date | number | string;
    readonly seed?: number | string;
    readonly kind?: "stock" | "crypto";
    readonly prices?: readonly number[];
    readonly ohlc?: readonly Partial<GeneratedMarketBar>[];
  }

  export function generateStock(options?: GenerateStockOptions): GeneratedStock;
}
