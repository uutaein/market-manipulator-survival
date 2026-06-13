import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineStyle,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp
} from "lightweight-charts";

export interface PriceCandle {
  readonly startSec: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export interface PriceChartOverlayUpdate {
  readonly candles: readonly PriceCandle[];
  readonly targetBandMin: number;
  readonly targetBandMax: number;
  readonly crashLine: number;
  readonly averageEntryPriceChangePercent: number | null;
}

export interface MarketBoardRankRow {
  readonly key: string;
  readonly label: string;
  readonly roleLabel: string;
  readonly rank: number;
  readonly previousRank: number | null;
  readonly rankMarker: string;
  readonly referencePrice: number;
  readonly currentPrice: number;
  readonly averageEntryPrice: number;
  readonly priceChangePercent: number;
  readonly fictionalVolume: number;
  readonly fictionalTradeValue: number;
  readonly trend: string;
  readonly newsBadge: string;
  readonly newsTone: "positive" | "negative" | null;
}

export interface MarketTerminalModel {
  readonly peerRows: readonly MarketBoardRankRow[];
  readonly sectorRows: readonly MarketBoardRankRow[];
  readonly dashboardRows: readonly MarketBoardRankRow[];
  readonly rankRows: readonly MarketBoardRankRow[];
  readonly ranks: Map<string, number>;
}

export interface OrderBookOverlayLevel {
  readonly offsetPercent: number;
  readonly priceChangePercent: number;
  readonly bidDepth: number;
  readonly askDepth: number;
}

export interface OrderBookOverlayUpdate {
  readonly openingPrice: number;
  readonly currentPrice: number;
  readonly priceChangePercent: number;
  readonly levels: readonly OrderBookOverlayLevel[];
  readonly sellWallLabel: string;
  readonly buyWallLabel: string;
}

export function buildPriceCandles(history: readonly { readonly elapsedSec: number; readonly priceChangePercent: number; readonly fictionalVolume: number }[], secondsPerCandle = 6): readonly PriceCandle[] {
  const buckets = new Map<number, typeof history>();

  for (const point of history) {
    const bucketStart = Math.floor(point.elapsedSec / secondsPerCandle) * secondsPerCandle;
    buckets.set(bucketStart, [...(buckets.get(bucketStart) ?? []), point]);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left - right)
    .map(([startSec, points]) => {
      const sortedPoints = [...points].sort((left, right) => left.elapsedSec - right.elapsedSec);
      const prices = sortedPoints.map((point) => point.priceChangePercent);

      return {
        startSec,
        open: prices[0],
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: prices[prices.length - 1],
        volume: sortedPoints.reduce((total, point) => total + point.fictionalVolume, 0)
      };
    });
}

export class IntradayPriceChartOverlay {
  private readonly container: HTMLDivElement;
  private readonly chart: IChartApi;
  private readonly candleSeries: ISeriesApi<"Candlestick">;
  private readonly volumeSeries: ISeriesApi<"Histogram">;
  private readonly targetMinLine: IPriceLine;
  private readonly targetMaxLine: IPriceLine;
  private readonly crashLine: IPriceLine;
  private readonly averageEntryLine: IPriceLine;
  private readonly syncLayout: () => void;
  private currentSize = { width: 0, height: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds
  ) {
    this.container = createOverlayElement("mms-price-chart-overlay");
    this.chart = createChart(this.container, {
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      autoSize: false,
      kineticScroll: { mouse: false, touch: false },
      handleScroll: false,
      handleScale: false,
      layout: {
        background: { type: ColorType.Solid, color: "#071015" },
        textColor: "#9aa7aa",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: 10
      },
      grid: {
        vertLines: { color: "#15252d" },
        horzLines: { color: "#15252d" }
      },
      rightPriceScale: {
        borderColor: "#263038",
        scaleMargins: {
          top: 0.1,
          bottom: 0.28
        }
      },
      timeScale: {
        borderColor: "#263038",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true
      },
      localization: {
        priceFormatter: formatChartPercent
      }
    });
    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: "#00c087",
      downColor: "#f6465d",
      borderUpColor: "#00d69a",
      borderDownColor: "#ff6677",
      wickUpColor: "#00d69a",
      wickDownColor: "#ff6677",
      priceFormat: {
        type: "custom",
        formatter: formatChartPercent
      }
    });
    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      lastValueVisible: false,
      priceLineVisible: false
    });
    this.chart.priceScale("").applyOptions({
      scaleMargins: {
        top: 0.74,
        bottom: 0
      }
    });
    this.targetMinLine = this.candleSeries.createPriceLine(createReferenceLineOptions(bounds.targetMinFallback ?? 0, "#8f9f7a", "TARGET L"));
    this.targetMaxLine = this.candleSeries.createPriceLine(createReferenceLineOptions(bounds.targetMaxFallback ?? 0, "#8f9f7a", "TARGET H"));
    this.crashLine = this.candleSeries.createPriceLine(createReferenceLineOptions(bounds.crashFallback ?? -20, "#c46b5b", "CRASH"));
    this.averageEntryLine = this.candleSeries.createPriceLine({
      price: bounds.averageEntryFallback ?? 0,
      color: "#e0d3a2",
      lineWidth: 2 as const,
      lineStyle: LineStyle.Dashed,
      lineVisible: false,
      axisLabelVisible: false,
      title: "AVG"
    });
    this.syncLayout = () => this.positionAndResize();
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.positionAndResize();
  }

  update(update: PriceChartOverlayUpdate): void {
    this.positionAndResize();
    this.candleSeries.setData(
      update.candles.map((candle): CandlestickData<UTCTimestamp> => ({
        time: chartTime(candle.startSec),
        open: roundChartPercent(candle.open),
        high: roundChartPercent(candle.high),
        low: roundChartPercent(candle.low),
        close: roundChartPercent(candle.close)
      }))
    );
    this.volumeSeries.setData(
      update.candles.map((candle): HistogramData<UTCTimestamp> => ({
        time: chartTime(candle.startSec),
        value: candle.volume,
        color: candle.close >= candle.open ? "rgba(0, 192, 135, 0.36)" : "rgba(246, 70, 93, 0.42)"
      }))
    );
    this.targetMinLine.applyOptions({ price: update.targetBandMin });
    this.targetMaxLine.applyOptions({ price: update.targetBandMax });
    this.crashLine.applyOptions({ price: update.crashLine });
    this.averageEntryLine.applyOptions(
      update.averageEntryPriceChangePercent === null
        ? { lineVisible: false, axisLabelVisible: false }
        : {
            price: update.averageEntryPriceChangePercent,
            lineVisible: true,
            axisLabelVisible: true
          }
    );
    this.chart.timeScale().fitContent();
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? "block" : "none";
  }

  destroy(): void {
    window.removeEventListener("resize", this.syncLayout);
    this.scene.scale.off("resize", this.syncLayout);
    this.chart.remove();
    this.container.remove();
  }

  private positionAndResize(): void {
    const size = positionOverlayElement(this.scene, this.container, this.bounds);

    if (size.width !== this.currentSize.width || size.height !== this.currentSize.height) {
      this.currentSize = size;
      this.chart.resize(size.width, size.height);
    }
  }
}

export class IntradayMarketTerminalOverlay {
  private readonly container: HTMLDivElement;
  private readonly panels: readonly TerminalPanel[];
  private readonly syncLayout: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds
  ) {
    this.container = createOverlayElement("mms-market-terminal-overlay");
    this.panels = [
      new TerminalPanel(this.container, "경쟁사 근황", true, "compact"),
      new TerminalPanel(this.container, "타 섹터 근황", true, "normal"),
      new TerminalPanel(this.container, "마켓 대시보드", true, "ranked")
    ];
    this.syncLayout = () => positionOverlayElement(this.scene, this.container, this.bounds);
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.syncLayout();
  }

  update(model: MarketTerminalModel): void {
    this.syncLayout();
    this.panels[0].update(model.peerRows);
    this.panels[1].update(model.sectorRows);
    this.panels[2].update(model.dashboardRows);
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? "grid" : "none";
  }

  destroy(): void {
    window.removeEventListener("resize", this.syncLayout);
    this.scene.scale.off("resize", this.syncLayout);
    this.container.remove();
  }
}

export class IntradayOrderBookOverlay {
  private readonly container: HTMLDivElement;
  private readonly askBody: HTMLDivElement;
  private readonly bidBody: HTMLDivElement;
  private readonly midPrice: HTMLDivElement;
  private readonly imbalance: HTMLDivElement;
  private readonly askRows: HTMLDivElement[];
  private readonly bidRows: HTMLDivElement[];
  private readonly syncLayout: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds
  ) {
    this.container = createOverlayElement("mms-orderbook-overlay");
    const title = document.createElement("div");
    title.className = "mms-orderbook-title";
    title.textContent = "ORDER BOOK";
    const header = document.createElement("div");
    header.className = "mms-orderbook-header";
    header.innerHTML = "<span>PRICE</span><span>SIZE</span>";
    this.askBody = document.createElement("div");
    this.askBody.className = "mms-orderbook-body ask";
    this.midPrice = document.createElement("div");
    this.midPrice.className = "mms-orderbook-mid";
    this.bidBody = document.createElement("div");
    this.bidBody.className = "mms-orderbook-body bid";
    this.imbalance = document.createElement("div");
    this.imbalance.className = "mms-orderbook-imbalance";
    this.askRows = createOrderBookRows(this.askBody, 3);
    this.bidRows = createOrderBookRows(this.bidBody, 3);
    this.container.append(title, header, this.askBody, this.midPrice, this.bidBody, this.imbalance);
    this.syncLayout = () => positionOverlayElement(this.scene, this.container, this.bounds);
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.syncLayout();
  }

  update(update: OrderBookOverlayUpdate): void {
    this.syncLayout();
    const askLevels = update.levels
      .filter((level) => level.offsetPercent > 0)
      .sort((left, right) => right.priceChangePercent - left.priceChangePercent);
    const bidLevels = update.levels
      .filter((level) => level.offsetPercent < 0)
      .sort((left, right) => right.priceChangePercent - left.priceChangePercent);
    const maxDepth = Math.max(...update.levels.flatMap((level) => [level.askDepth, level.bidDepth]), 1);

    updateOrderBookRows(this.askRows, askLevels, "ask", update.openingPrice, maxDepth);
    updateOrderBookRows(this.bidRows, bidLevels, "bid", update.openingPrice, maxDepth);
    this.midPrice.textContent = `${formatCompactPrice(update.currentPrice)}  ${formatPercent(update.priceChangePercent)}`;
    this.midPrice.className = `mms-orderbook-mid ${update.priceChangePercent >= 0 ? "price-up" : "price-down"}`;
    this.imbalance.textContent = `ASK ${update.sellWallLabel.toUpperCase()} / BID ${update.buyWallLabel.toUpperCase()}`;
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? "block" : "none";
  }

  destroy(): void {
    window.removeEventListener("resize", this.syncLayout);
    this.scene.scale.off("resize", this.syncLayout);
    this.container.remove();
  }
}

class TerminalPanel {
  private readonly element: HTMLElement;
  private readonly body: HTMLDivElement;
  private readonly rowPool: HTMLDivElement[] = [];

  constructor(
    parent: HTMLElement,
    title: string,
    showHeader: boolean,
    variant: "compact" | "normal" | "ranked"
  ) {
    this.element = document.createElement("section");
    this.element.className = `mms-terminal-panel mms-terminal-panel-${variant}`;
    const heading = document.createElement("div");
    heading.className = "mms-terminal-heading";
    heading.textContent = title;
    this.body = document.createElement("div");
    this.body.className = "mms-terminal-body";

    this.element.append(heading);

    if (showHeader) {
      const header = document.createElement("div");
      header.className = "mms-terminal-row mms-terminal-header";
      header.innerHTML = `<span></span><span></span><span>NOW</span><span>AVG</span><span>CHG</span><span>VALUE</span>`;
      this.element.append(header);
    }

    this.element.append(this.body);
    parent.append(this.element);
  }

  update(rows: readonly MarketBoardRankRow[]): void {
    while (this.rowPool.length < rows.length) {
      const rowElement = document.createElement("div");
      rowElement.className = "mms-terminal-row";
      rowElement.innerHTML =
        `<span class="mms-market-icon"></span>` +
        `<span class="mms-market-name"></span>` +
        `<span class="mms-market-now"></span>` +
        `<span class="mms-market-avg"></span>` +
        `<span class="mms-market-change"></span>` +
        `<span class="mms-market-value"></span>`;
      this.body.append(rowElement);
      this.rowPool.push(rowElement);
    }

    this.rowPool.forEach((rowElement, index) => {
      const row = rows[index];
      rowElement.hidden = !row;

      if (!row) {
        return;
      }

      const rankDirection = row.rankMarker === "▲" ? "up" : row.rankMarker === "▼" ? "down" : "flat";
      const priceDirection = row.priceChangePercent >= 0 ? "price-up" : "price-down";
      const newsState =
        row.newsTone === "positive" ? "news-positive" : row.newsTone === "negative" ? "news-negative" : "no-news";
      rowElement.className = `mms-terminal-row role-${row.roleLabel.toLowerCase()} motion-${rankDirection} ${priceDirection} ${newsState}`;
      rowElement.style.setProperty("--icon-color", getMarketIconColor(row.key));
      rowElement.style.setProperty("--motion-offset", `${getRankMotionOffset(row)}px`);
      setCell(
        rowElement,
        ".mms-market-name",
        `${row.roleLabel} ${row.rank > 0 ? `${row.rankMarker}${row.rank} ` : ""}${fitMarketLabel(row.label, 14)}`
      );
      setCell(rowElement, ".mms-market-now", formatCompactPrice(row.currentPrice));
      setCell(rowElement, ".mms-market-avg", formatCompactPrice(row.averageEntryPrice));
      setCell(rowElement, ".mms-market-change", formatPercent(row.priceChangePercent));
      setCell(rowElement, ".mms-market-value", formatCompactNumber(row.fictionalTradeValue));
    });
  }
}

interface GameOverlayBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly targetMinFallback?: number;
  readonly targetMaxFallback?: number;
  readonly crashFallback?: number;
  readonly averageEntryFallback?: number;
}

function createOverlayElement(className: string): HTMLDivElement {
  const parent = document.querySelector<HTMLElement>("#app") ?? document.body;
  const element = document.createElement("div");
  element.className = className;
  parent.append(element);
  return element;
}

function createOrderBookRows(parent: HTMLElement, count: number): HTMLDivElement[] {
  return Array.from({ length: count }, () => {
    const row = document.createElement("div");
    row.className = "mms-orderbook-row";
    row.innerHTML =
      `<span class="mms-orderbook-depth"></span>` +
      `<span class="mms-orderbook-price"></span>` +
      `<span class="mms-orderbook-size"></span>`;
    parent.append(row);
    return row;
  });
}

function updateOrderBookRows(
  rows: readonly HTMLDivElement[],
  levels: readonly OrderBookOverlayLevel[],
  side: "ask" | "bid",
  openingPrice: number,
  maxDepth: number
): void {
  rows.forEach((rowElement, index) => {
    const level = levels[index];

    if (!level) {
      rowElement.hidden = true;
      return;
    }

    const depth = side === "ask" ? level.askDepth : level.bidDepth;
    const price = openingPrice * (1 + level.priceChangePercent / 100);
    rowElement.hidden = false;
    rowElement.className = `mms-orderbook-row ${side}`;
    rowElement.style.setProperty("--depth-width", `${Math.max(5, (depth / maxDepth) * 100)}%`);
    setCell(rowElement, ".mms-orderbook-price", formatCompactPrice(price));
    setCell(rowElement, ".mms-orderbook-size", `${Math.round(depth * 13).toLocaleString("ko-KR")}`);
  });
}

function positionOverlayElement(
  scene: Phaser.Scene,
  element: HTMLElement,
  bounds: GameOverlayBounds
): { readonly width: number; readonly height: number } {
  const parent = document.querySelector<HTMLElement>("#app") ?? document.body;
  const canvas = scene.game.canvas;
  const parentRect = parent.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const gameWidth = scene.scale.gameSize.width;
  const gameHeight = scene.scale.gameSize.height;
  const scaleX = canvasRect.width / gameWidth;
  const scaleY = canvasRect.height / gameHeight;
  const width = Math.max(1, Math.round(bounds.width * scaleX));
  const height = Math.max(1, Math.round(bounds.height * scaleY));

  element.style.left = `${Math.round(canvasRect.left - parentRect.left + bounds.x * scaleX)}px`;
  element.style.top = `${Math.round(canvasRect.top - parentRect.top + bounds.y * scaleY)}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.setProperty("--mms-overlay-scale", `${Math.min(scaleX, scaleY)}`);

  return { width, height };
}

function createReferenceLineOptions(price: number, color: string, title: string) {
  return {
    price,
    color,
    lineWidth: 1 as const,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: false,
    title
  };
}

function chartTime(startSec: number): UTCTimestamp {
  return (Math.max(1, Math.round(startSec + 1)) as UTCTimestamp);
}

function roundChartPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatChartPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function setCell(rowElement: HTMLElement, selector: string, value: string): void {
  const cell = rowElement.querySelector<HTMLElement>(selector);

  if (cell) {
    cell.textContent = value;
  }
}

function fitMarketLabel(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}.` : value;
}

function getMarketIconColor(key: string): string {
  const palette = ["#d9c58b", "#8f9f7a", "#7fb4c8", "#c46b5b", "#b994d1", "#d6a86f", "#8fa2a6", "#e0d3a2"];
  return palette[hashString(key) % palette.length];
}

function getRankMotionOffset(row: MarketBoardRankRow): number {
  if (!row.previousRank) {
    return 0;
  }

  const rankDelta = row.rank - row.previousRank;

  if (rankDelta === 0) {
    return 0;
  }

  return Math.max(-10, Math.min(10, rankDelta * 3));
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return `${Math.round(value)}`;
}

function formatCompactPrice(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}
