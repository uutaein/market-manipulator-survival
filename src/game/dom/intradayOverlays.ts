import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineStyle,
  createChart,
  type AutoscaleInfoProvider,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type MouseEventParams,
  type TickMarkType,
  type Time,
  type UTCTimestamp,
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
  readonly dayCumulativeBars: readonly DayCumulativeChartBar[];
  readonly runLengthDays: number;
  readonly targetBandMin: number;
  readonly targetBandMax: number;
  readonly crashLine: number;
  readonly averageEntryPriceChangePercent: number | null;
}

export interface DayCumulativeChartBar {
  readonly day: number;
  readonly value: number;
  readonly current: boolean;
}

type ChartCandleData = CandlestickData<UTCTimestamp>;
type ChartHistogramData = HistogramData<UTCTimestamp>;
type PriceChartMode = "live" | "cumulative";

const priceChartTabHeightPx = 22;
const priceChartLiveVisibleBars = 8;
const priceChartCumulativeVisibleBars = 36;
const priceChartRightPaddingBars = 3;
const currentCandleJitterThresholdPercent = 0.18;
const currentCandleJitterDurationMs = 260;
const stableCumulativeAutoscale: AutoscaleInfoProvider = (
  baseImplementation,
) => {
  const scale = baseImplementation();

  if (!scale?.priceRange) {
    return scale;
  }

  return {
    ...scale,
    priceRange: {
      minValue: Math.min(scale.priceRange.minValue, -1),
      maxValue: Math.max(scale.priceRange.maxValue, 1),
    },
  };
};

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
  readonly tradeValues: Map<string, number>;
  readonly currentDay: number;
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
  readonly wallActions: readonly OrderBookOverlayWallAction[];
}

export type OrderBookOverlayWallSide = "buy" | "sell";

export interface OrderBookOverlayWallAction {
  readonly side: OrderBookOverlayWallSide;
  readonly offsetPercent: number;
  readonly priceChangePercent: number;
  readonly label: string;
  readonly statusLabel: string;
  readonly disabled: boolean;
  readonly active: boolean;
  readonly cooldownRemainingSec: number;
  readonly remainingDepthTone?: "normal" | "low";
  readonly remainingTimeTone?: "normal" | "expiring";
  readonly remainingActiveSec?: number;
  readonly totalActiveSec?: number;
  readonly recentOutcomeTone?: "expired";
  readonly recentOutcomeReserveBudget?: number;
  readonly remainingDepthBoost?: number;
  readonly initialDepthBoost?: number;
  readonly remainingReservedBudget?: number;
  readonly initialReservedBudget?: number;
}

export type IntradayTelemetryTone =
  | "positive"
  | "negative"
  | "warning"
  | "neutral";

export interface IntradayTelemetryCard {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone: IntradayTelemetryTone;
}

export interface IntradayTelemetryStatus {
  readonly label: string;
  readonly value: string;
  readonly tone: IntradayTelemetryTone;
}

export interface IntradayTelemetryOverlayUpdate {
  readonly cards: readonly IntradayTelemetryCard[];
  readonly statuses: readonly IntradayTelemetryStatus[];
}

export function buildPriceCandles(
  history: readonly {
    readonly elapsedSec: number;
    readonly priceChangePercent: number;
    readonly fictionalVolume: number;
  }[],
  secondsPerCandle = 6,
): readonly PriceCandle[] {
  const buckets = new Map<number, typeof history>();

  for (const point of history) {
    const bucketStart =
      Math.floor(point.elapsedSec / secondsPerCandle) * secondsPerCandle;
    buckets.set(bucketStart, [...(buckets.get(bucketStart) ?? []), point]);
  }

  let previousClose: number | null = null;

  return [...buckets.entries()]
    .sort(([left], [right]) => left - right)
    .map(([startSec, points]) => {
      const sortedPoints = [...points].sort(
        (left, right) => left.elapsedSec - right.elapsedSec,
      );
      const prices = sortedPoints.map((point) => point.priceChangePercent);
      const open = previousClose ?? prices[0];
      const close = prices[prices.length - 1];
      const high = Math.max(open, ...prices);
      const low = Math.min(open, ...prices);

      previousClose = close;

      return {
        startSec,
        open,
        high,
        low,
        close,
        volume: sortedPoints.reduce(
          (total, point) => total + point.fictionalVolume,
          0,
        ),
      };
    });
}

export class IntradayTelemetryOverlay {
  private readonly container: HTMLDivElement;
  private readonly cardElements: readonly HTMLDivElement[];
  private readonly statusElements: readonly HTMLDivElement[];
  private readonly syncLayout: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds,
  ) {
    this.container = createOverlayElement("mms-telemetry-overlay");
    this.container.setAttribute("aria-label", "Intraday account telemetry");

    const cards = document.createElement("div");
    cards.className = "mms-telemetry-cards";
    const statuses = document.createElement("div");
    statuses.className = "mms-telemetry-statuses";
    this.cardElements = Array.from({ length: 4 }, () => {
      const card = document.createElement("div");
      card.className = "mms-telemetry-card neutral";
      card.innerHTML =
        `<span class="mms-telemetry-label"></span>` +
        `<strong class="mms-telemetry-value"></strong>` +
        `<span class="mms-telemetry-detail"></span>`;
      cards.append(card);
      return card;
    });
    this.statusElements = Array.from({ length: 3 }, () => {
      const status = document.createElement("div");
      status.className = "mms-telemetry-status neutral";
      status.innerHTML =
        `<span class="mms-telemetry-status-label"></span>` +
        `<strong class="mms-telemetry-status-value"></strong>`;
      statuses.append(status);
      return status;
    });

    this.container.append(cards, statuses);
    this.syncLayout = () =>
      positionOverlayElement(this.scene, this.container, this.bounds);
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.syncLayout();
  }

  update(update: IntradayTelemetryOverlayUpdate): void {
    this.syncLayout();
    this.cardElements.forEach((card, index) => {
      const item = update.cards[index];
      card.hidden = !item;

      if (!item) {
        return;
      }

      setTelemetryTone(card, item.tone);
      setCell(card, ".mms-telemetry-label", item.label);
      setCell(card, ".mms-telemetry-value", item.value);
      setCell(card, ".mms-telemetry-detail", item.detail);
    });
    this.statusElements.forEach((status, index) => {
      const item = update.statuses[index];
      status.hidden = !item;

      if (!item) {
        return;
      }

      setTelemetryTone(status, item.tone);
      setCell(status, ".mms-telemetry-status-label", item.label);
      setCell(status, ".mms-telemetry-status-value", item.value);
    });
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

export class IntradayPriceChartOverlay {
  private readonly container: HTMLDivElement;
  private readonly chartHost: HTMLDivElement;
  private readonly volumeTooltip: HTMLDivElement;
  private readonly averageEntryMarker: HTMLDivElement;
  private readonly averageEntryMarkerLabel: HTMLSpanElement;
  private readonly tabButtons: readonly HTMLButtonElement[];
  private readonly chart: IChartApi;
  private readonly candleSeries: ISeriesApi<"Candlestick">;
  private readonly volumeSeries: ISeriesApi<"Histogram">;
  private readonly cumulativeSeries: ISeriesApi<"Histogram">;
  private readonly targetMinLine: IPriceLine;
  private readonly targetMaxLine: IPriceLine;
  private readonly crashLine: IPriceLine;
  private readonly averageEntryLine: IPriceLine;
  private readonly syncLayout: () => void;
  private currentSize = { width: 0, height: 0 };
  private displayedCandles: readonly ChartCandleData[] = [];
  private readonly liveTickSeconds = new Map<number, number>();
  private chartMode: PriceChartMode = "live";
  private currentAverageEntryPriceChangePercent = 0;
  private currentCandleJitterFrameId: number | null = null;
  private readonly formatTickMark = (
    time: Time,
    tickMarkType: TickMarkType,
    locale: string,
  ): string =>
    formatPriceChartTick(
      time,
      tickMarkType,
      locale,
      this.liveTickSeconds,
    );
  private readonly handleTabClick = (event: MouseEvent): void => {
    const button = (event.currentTarget as HTMLButtonElement | null) ?? null;
    const mode = button?.dataset.chartMode;

    if (!isPriceChartMode(mode)) {
      return;
    }

    event.preventDefault();
    this.chartMode = mode;
    this.refreshChartMode();
  };
  private readonly handleCrosshairMove = (
    param: MouseEventParams<Time>,
  ): void => {
    if (!param.point || !isPriceCandleChartMode(this.chartMode)) {
      this.hideVolumeTooltip();
      return;
    }

    const chartWidth = this.chartHost.clientWidth || this.currentSize.width;
    const chartHeight = this.chartHost.clientHeight || this.currentSize.height;
    const volumeBandStartY = chartHeight * 0.72;

    if (
      chartWidth <= 0 ||
      chartHeight <= 0 ||
      param.point.x < 0 ||
      param.point.x > chartWidth ||
      param.point.y < volumeBandStartY ||
      param.point.y > chartHeight
    ) {
      this.hideVolumeTooltip();
      return;
    }

    const volumeData = param.seriesData.get(this.volumeSeries);

    if (!isChartHistogramData(volumeData)) {
      this.hideVolumeTooltip();
      return;
    }

    this.volumeTooltip.textContent = `거래량 ${formatVolumeTooltipValue(
      volumeData.value,
    )}`;
    this.volumeTooltip.style.left = `${Math.max(
      46,
      Math.min(chartWidth - 46, param.point.x),
    )}px`;
    this.volumeTooltip.style.top = `${Math.max(
      18,
      Math.min(chartHeight - 4, param.point.y - 8),
    )}px`;
    this.volumeTooltip.hidden = false;
    this.volumeTooltip.classList.add("visible");
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds,
  ) {
    this.container = createOverlayElement("mms-price-chart-overlay");
    const tabs = document.createElement("div");
    tabs.className = "mms-price-chart-tabs";
    this.tabButtons = priceChartModeValues.map((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mms-price-chart-tab";
      button.dataset.chartMode = mode;
      button.setAttribute("role", "tab");
      button.textContent = getPriceChartModeLabel(mode);
      button.title = getPriceChartModeTitle(mode);
      button.addEventListener("click", this.handleTabClick);
      tabs.append(button);
      return button;
    });
    this.chartHost = document.createElement("div");
    this.chartHost.className = "mms-price-chart-host";
    this.container.append(tabs, this.chartHost);

    this.chart = createChart(this.chartHost, {
      width: Math.round(bounds.width),
      height: Math.round(Math.max(1, bounds.height - priceChartTabHeightPx)),
      autoSize: false,
      kineticScroll: { mouse: false, touch: false },
      handleScroll: false,
      handleScale: false,
      layout: {
        background: { type: ColorType.Solid, color: "#071015" },
        textColor: "#c2d0d3",
        fontFamily:
          '"IBM Plex Mono", "Malgun Gothic", "Apple SD Gothic Neo", Consolas, "Courier New", monospace',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "#15252d" },
        horzLines: { color: "#15252d" },
      },
      rightPriceScale: {
        borderColor: "#263038",
        scaleMargins: {
          top: 0.1,
          bottom: 0.28,
        },
      },
      timeScale: {
        borderColor: "#263038",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 8,
        minBarSpacing: 6,
        maxBarSpacing: 10,
        tickMarkFormatter: this.formatTickMark,
      },
      localization: {
        priceFormatter: formatChartPercent,
      },
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
        formatter: formatChartPercent,
      },
    });
    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    this.cumulativeSeries = this.chart.addSeries(HistogramSeries, {
      base: 0,
      color: "rgba(45, 212, 191, 0.68)",
      lastValueVisible: true,
      priceLineVisible: false,
      visible: false,
      priceFormat: {
        type: "custom",
        formatter: formatChartPercent,
      },
      autoscaleInfoProvider: stableCumulativeAutoscale,
    });
    this.chart.priceScale("").applyOptions({
      scaleMargins: {
        top: 0.74,
        bottom: 0,
      },
    });
    this.volumeTooltip = document.createElement("div");
    this.volumeTooltip.className = "mms-price-chart-volume-tooltip";
    this.volumeTooltip.hidden = true;
    this.chartHost.append(this.volumeTooltip);
    this.chart.subscribeCrosshairMove(this.handleCrosshairMove);
    this.targetMinLine = this.candleSeries.createPriceLine(
      createReferenceLineOptions(
        bounds.targetMinFallback ?? 0,
        "#7df3e7",
        "TARGET L",
      ),
    );
    this.targetMaxLine = this.candleSeries.createPriceLine(
      createReferenceLineOptions(
        bounds.targetMaxFallback ?? 0,
        "#7df3e7",
        "TARGET H",
      ),
    );
    this.crashLine = this.candleSeries.createPriceLine(
      createReferenceLineOptions(
        bounds.crashFallback ?? -20,
        "#ff6677",
        "CRASH",
      ),
    );
    this.averageEntryLine = this.candleSeries.createPriceLine({
      price: bounds.averageEntryFallback ?? 0,
      color: "#8bd3ff",
      lineWidth: 2 as const,
      lineStyle: LineStyle.Dashed,
      lineVisible: true,
      axisLabelVisible: true,
      title: "매수 평균가",
    });
    this.averageEntryMarker = document.createElement("div");
    this.averageEntryMarker.className = "mms-price-chart-average-marker";
    this.averageEntryMarkerLabel = document.createElement("span");
    this.averageEntryMarkerLabel.className =
      "mms-price-chart-average-marker-label";
    this.averageEntryMarker.append(this.averageEntryMarkerLabel);
    this.chartHost.append(this.averageEntryMarker);
    this.syncLayout = () => this.positionAndResize();
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.positionAndResize();
    this.refreshChartMode();
  }

  update(update: PriceChartOverlayUpdate): void {
    this.positionAndResize();
    this.liveTickSeconds.clear();
    const nextCandles = update.candles.map(
      (candle, index): ChartCandleData => {
        const time = chartIndexTime(index);
        this.liveTickSeconds.set(time, candle.startSec);

        return {
          time,
          open: roundChartPercent(candle.open),
          high: roundChartPercent(candle.high),
          low: roundChartPercent(candle.low),
          close: roundChartPercent(candle.close),
        };
      },
    );
    const nextVolumes = update.candles.map(
      (candle, index): ChartHistogramData => ({
        time: chartIndexTime(index),
        value: candle.volume,
        color:
          candle.close >= candle.open
            ? "rgba(0, 192, 135, 0.36)"
            : "rgba(246, 70, 93, 0.42)",
        }),
    );
    this.cumulativeSeries.setData([
      ...buildDayCumulativeHistogramData(update.dayCumulativeBars),
    ]);
    this.applySeriesData(nextCandles, nextVolumes);
    this.targetMinLine.applyOptions({ price: update.targetBandMin });
    this.targetMaxLine.applyOptions({ price: update.targetBandMax });
    this.crashLine.applyOptions({ price: update.crashLine });
    this.currentAverageEntryPriceChangePercent =
      update.averageEntryPriceChangePercent ?? 0;
    this.averageEntryLine.applyOptions({
      price: this.currentAverageEntryPriceChangePercent,
      lineVisible: true,
      axisLabelVisible: true,
      title: "매수 평균가",
    });
    this.positionAverageEntryMarker();
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? "grid" : "none";
  }

  destroy(): void {
    window.removeEventListener("resize", this.syncLayout);
    this.scene.scale.off("resize", this.syncLayout);
    this.tabButtons.forEach((button) =>
      button.removeEventListener("click", this.handleTabClick),
    );
    this.chart.unsubscribeCrosshairMove(this.handleCrosshairMove);
    this.cancelCurrentCandleJitter(false);
    this.chart.remove();
    this.container.remove();
  }

  private applySeriesData(
    candles: readonly ChartCandleData[],
    volumes: readonly ChartHistogramData[],
  ): void {
    const previousCandles = this.displayedCandles;

    this.cancelCurrentCandleJitter(false);
    this.displayedCandles = candles;
    this.candleSeries.setData([...candles]);
    this.volumeSeries.setData([...volumes]);
    this.refreshTimeScale();
    this.animateCurrentCandleJitter(previousCandles, candles);
  }

  private refreshChartMode(): void {
    this.cancelCurrentCandleJitter(true);
    this.hideVolumeTooltip();
    const isPriceCandles =
      isPriceCandleChartMode(this.chartMode);

    this.candleSeries.applyOptions({ visible: isPriceCandles });
    this.volumeSeries.applyOptions({ visible: isPriceCandles });
    this.cumulativeSeries.applyOptions({ visible: false });

    this.tabButtons.forEach((button) => {
      const selected = button.dataset.chartMode === this.chartMode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });
    this.refreshTimeScale();
    this.positionAverageEntryMarker();
  }

  private animateCurrentCandleJitter(
    previousCandles: readonly ChartCandleData[],
    candles: readonly ChartCandleData[],
  ): void {
    if (this.chartMode !== "live") {
      return;
    }

    const target = candles[candles.length - 1];
    const previous = previousCandles[previousCandles.length - 1];

    if (!target || !previous || target.time !== previous.time) {
      return;
    }

    const delta = target.close - previous.close;
    const moveScale = Math.abs(delta);

    if (moveScale < currentCandleJitterThresholdPercent) {
      return;
    }

    const startedAt = performance.now();
    const direction = delta >= 0 ? 1 : -1;
    const amplitude = Math.min(
      0.08,
      (moveScale - currentCandleJitterThresholdPercent) * 0.26 + 0.012,
    );

    const animate = (now: number): void => {
      const progress = Math.min(
        1,
        (now - startedAt) / currentCandleJitterDurationMs,
      );
      const envelope = Math.sin(progress * Math.PI);
      const offset = roundChartPercent(
        (Math.sin(progress * Math.PI * 5.7) * amplitude +
          Math.sin(progress * Math.PI * 2.4) * amplitude * -direction * 0.32) *
          envelope,
      );
      const close = roundChartPercent(target.close + offset);
      const high = roundChartPercent(Math.max(target.high, target.close, close));
      const low = roundChartPercent(Math.min(target.low, target.close, close));

      this.candleSeries.update({
        ...target,
        high,
        low,
        close,
      });

      if (progress < 1) {
        this.currentCandleJitterFrameId = requestAnimationFrame(animate);
        return;
      }

      this.currentCandleJitterFrameId = null;
      this.candleSeries.update(target);
    };

    this.currentCandleJitterFrameId = requestAnimationFrame(animate);
  }

  private cancelCurrentCandleJitter(restoreTarget: boolean): void {
    if (this.currentCandleJitterFrameId !== null) {
      cancelAnimationFrame(this.currentCandleJitterFrameId);
      this.currentCandleJitterFrameId = null;
    }

    if (!restoreTarget) {
      return;
    }

    const target = this.displayedCandles[this.displayedCandles.length - 1];

    if (target) {
      this.candleSeries.update(target);
    }
  }

  private refreshTimeScale(): void {
    this.chart.applyOptions({
      timeScale: {
        tickMarkFormatter: this.formatTickMark,
      },
    });

    const visibleBars =
      this.chartMode === "live"
        ? priceChartLiveVisibleBars
        : priceChartCumulativeVisibleBars;
    const barSpacing = this.chartMode === "live" ? 20 : 8;
    const minBarSpacing = this.chartMode === "live" ? 12 : 6;
    const maxBarSpacing = this.chartMode === "live" ? 28 : 10;

    this.chart.timeScale().applyOptions({
      barSpacing,
      minBarSpacing,
      maxBarSpacing,
    });

    const lastIndex = this.displayedCandles.length - 1;

    if (lastIndex < 0) {
      return;
    }

    if (this.displayedCandles.length <= visibleBars) {
      this.chart.timeScale().setVisibleLogicalRange({
        from: -0.5,
        to: visibleBars - 0.5,
      });
      return;
    }

    this.chart.timeScale().setVisibleLogicalRange({
      from: lastIndex - visibleBars + 1,
      to: lastIndex + priceChartRightPaddingBars,
    });
  }

  private positionAndResize(): void {
    const size = positionOverlayElement(
      this.scene,
      this.container,
      this.bounds,
    );
    const chartWidth = this.chartHost.clientWidth || size.width;
    const chartHeight =
      this.chartHost.clientHeight ||
      Math.max(1, size.height - priceChartTabHeightPx);

    if (
      chartWidth !== this.currentSize.width ||
      chartHeight !== this.currentSize.height
    ) {
      this.currentSize = { width: chartWidth, height: chartHeight };
      this.chart.resize(chartWidth, chartHeight);
      this.positionAverageEntryMarker();
    }
  }

  private hideVolumeTooltip(): void {
    this.volumeTooltip.hidden = true;
    this.volumeTooltip.classList.remove("visible");
  }

  private positionAverageEntryMarker(): void {
    const chartHeight = this.chartHost.clientHeight || this.currentSize.height;
    const coordinate = this.candleSeries.priceToCoordinate(
      this.currentAverageEntryPriceChangePercent,
    );
    const fallbackY = chartHeight > 0 ? chartHeight * 0.5 : 0;
    const y = Math.max(
      2,
      Math.min(Math.max(2, chartHeight - 2), coordinate ?? fallbackY),
    );

    this.averageEntryMarker.style.top = `${Math.round(y)}px`;
    this.averageEntryMarkerLabel.textContent = `매수 평균가 ${formatChartPercent(
      this.currentAverageEntryPriceChangePercent,
    )}`;
  }
}

const priceChartModeValues: readonly PriceChartMode[] = [
  "live",
  "cumulative",
];

function isPriceChartMode(value: string | undefined): value is PriceChartMode {
  return priceChartModeValues.includes(value as PriceChartMode);
}

function isPriceCandleChartMode(mode: PriceChartMode): boolean {
  return mode === "live" || mode === "cumulative";
}

function getPriceChartModeLabel(mode: PriceChartMode): string {
  switch (mode) {
    case "live":
      return "LIVE";
    case "cumulative":
      return "누적";
  }
}

function getPriceChartModeTitle(mode: PriceChartMode): string {
  switch (mode) {
    case "live":
      return "실시간 캔들";
    case "cumulative":
      return "장중 누적 캔들";
  }
}

function buildDayCumulativeHistogramData(
  bars: readonly DayCumulativeChartBar[],
): readonly ChartHistogramData[] {
  return bars.map((bar) => {
    const value = roundChartPercent(bar.value);

    return {
      time: dayChartTime(bar.day),
      value,
      color:
        value >= 0
          ? bar.current
            ? "rgba(45, 212, 191, 0.74)"
            : "rgba(0, 192, 135, 0.58)"
          : bar.current
            ? "rgba(196, 107, 91, 0.78)"
            : "rgba(246, 70, 93, 0.64)",
    };
  });
}

export class IntradayMarketTerminalOverlay {
  private readonly container: HTMLDivElement;
  private readonly panels: readonly TerminalPanel[];
  private readonly dashboardPanel: TerminalPanel;
  private readonly syncLayout: () => void;
  private selectedDetailKey: string | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds,
  ) {
    this.container = createOverlayElement("mms-market-terminal-overlay");
    const peerPanel = new TerminalPanel(
      this.container,
      "경쟁사 근황",
      true,
      "compact",
    );
    const sectorPanel = new TerminalPanel(
      this.container,
      "타 섹터 근황",
      true,
      "normal",
    );
    this.dashboardPanel = new TerminalPanel(
      this.container,
      "마켓 대시보드",
      true,
      "ranked",
      (rowKey) => {
        this.selectedDetailKey = rowKey;
      },
    );
    this.panels = [peerPanel, sectorPanel, this.dashboardPanel];
    this.syncLayout = () =>
      positionOverlayElement(this.scene, this.container, this.bounds);
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.syncLayout();
  }

  update(model: MarketTerminalModel): MarketBoardRankRow | null {
    this.syncLayout();
    const playerRow = model.rankRows.find((row) => row.roleLabel === "ME");
    const playerRank = playerRow?.rank ?? 0;

    if (
      !this.selectedDetailKey ||
      !model.rankRows.some((row) => row.key === this.selectedDetailKey)
    ) {
      this.selectedDetailKey = playerRow?.key ?? model.rankRows[0]?.key ?? null;
    }

    const selectedRow =
      model.rankRows.find((row) => row.key === this.selectedDetailKey) ??
      playerRow ??
      model.rankRows[0] ??
      null;

    this.panels[0].update(
      model.peerRows,
      `${model.peerRows.length} PEER / 동일 섹터`,
    );
    this.panels[1].update(
      model.sectorRows,
      `${model.sectorRows.length} AVG / 타 섹터`,
    );
    this.panels[2].update(
      model.dashboardRows,
      playerRank > 0
        ? `ME #${playerRank}/${model.rankRows.length} / 선택 차트`
        : `24 종목 VALUE`,
      selectedRow?.key,
    );
    this.dashboardPanel.updateDetail(selectedRow, model.currentDay);
    return selectedRow;
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
  private readonly handleOrderBookRowClick = (event: MouseEvent): void => {
    const row = event.currentTarget as HTMLDivElement;

    event.preventDefault();
    event.stopPropagation();

    if (row.hidden || row.dataset.wallDisabled === "true") {
      return;
    }

    const wallSide = row.dataset.wallSide;

    if (wallSide === "buy" || wallSide === "sell") {
      const offsetPercent = Number(row.dataset.wallOffset);
      const priceChangePercent = Number(row.dataset.wallPriceChangePercent);

      if (
        Number.isFinite(offsetPercent) &&
        Number.isFinite(priceChangePercent)
      ) {
        this.onWallAction?.(wallSide, offsetPercent, priceChangePercent);
      }
    }
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: GameOverlayBounds,
    private readonly onWallAction?: (
      side: OrderBookOverlayWallSide,
      offsetPercent: number,
      priceChangePercent: number,
    ) => void,
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
    this.askRows = createOrderBookRows(this.askBody, 5);
    this.bidRows = createOrderBookRows(this.bidBody, 5);
    this.bindOrderBookRows(this.askRows, "sell");
    this.bindOrderBookRows(this.bidRows, "buy");
    this.container.append(
      title,
      header,
      this.askBody,
      this.midPrice,
      this.bidBody,
      this.imbalance,
    );
    this.syncLayout = () =>
      positionOverlayElement(this.scene, this.container, this.bounds);
    window.addEventListener("resize", this.syncLayout);
    this.scene.scale.on("resize", this.syncLayout);
    this.syncLayout();
  }

  update(update: OrderBookOverlayUpdate): void {
    this.syncLayout();
    const askLevels = update.levels
      .filter((level) => level.offsetPercent > 0)
      .sort(
        (left, right) => right.priceChangePercent - left.priceChangePercent,
      );
    const bidLevels = update.levels
      .filter((level) => level.offsetPercent < 0)
      .sort(
        (left, right) => right.priceChangePercent - left.priceChangePercent,
      );
    const maxDepth = Math.max(
      ...update.levels.flatMap((level) => [level.askDepth, level.bidDepth]),
      1,
    );

    updateOrderBookRows(
      this.askRows,
      askLevels,
      "ask",
      update.openingPrice,
      maxDepth,
      update.wallActions,
    );
    updateOrderBookRows(
      this.bidRows,
      bidLevels,
      "bid",
      update.openingPrice,
      maxDepth,
      update.wallActions,
    );
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
    [...this.askRows, ...this.bidRows].forEach((row) => {
      row.removeEventListener("click", this.handleOrderBookRowClick);
      cancelOrderBookRowAnimations(row);
    });
    this.container.remove();
  }

  private bindOrderBookRows(
    rows: readonly HTMLDivElement[],
    wallSide: OrderBookOverlayWallSide,
  ): void {
    rows.forEach((row) => {
      row.dataset.wallSide = wallSide;
      row.addEventListener("click", this.handleOrderBookRowClick);
    });
  }
}

class TerminalPanel {
  private readonly element: HTMLElement;
  private readonly scopeLabel: HTMLSpanElement;
  private readonly body: HTMLDivElement;
  private readonly detail: HTMLDivElement | null = null;
  private readonly rowPool: HTMLDivElement[] = [];

  constructor(
    parent: HTMLElement,
    title: string,
    showHeader: boolean,
    variant: "compact" | "normal" | "ranked",
    private readonly onRowSelect?: (rowKey: string) => void,
  ) {
    this.element = document.createElement("section");
    this.element.className = `mms-terminal-panel mms-terminal-panel-${variant}`;
    const heading = document.createElement("div");
    heading.className = "mms-terminal-heading";
    const titleLabel = document.createElement("span");
    titleLabel.className = "mms-terminal-title";
    titleLabel.textContent = title;
    this.scopeLabel = document.createElement("span");
    this.scopeLabel.className = "mms-terminal-scope";
    heading.append(titleLabel, this.scopeLabel);
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

    if (variant === "ranked") {
      this.detail = document.createElement("div");
      this.detail.className = "mms-market-detail";
      this.detail.innerHTML =
        `<div class="mms-market-detail-copy">` +
        `<span class="mms-market-detail-title"></span>` +
        `<span class="mms-market-detail-meta"></span>` +
        `</div>` +
        `<div class="mms-market-detail-signals" aria-label="selected asset signals">` +
        `<span class="mms-market-detail-signal mms-market-signal-rank"></span>` +
        `<span class="mms-market-detail-signal mms-market-signal-move"></span>` +
        `<span class="mms-market-detail-signal mms-market-signal-news"></span>` +
        `<span class="mms-market-detail-signal mms-market-signal-flow"></span>` +
        `</div>` +
        `<div class="mms-market-detail-note"></div>`;
      this.element.append(this.detail);
    }
    parent.append(this.element);
  }

  update(
    rows: readonly MarketBoardRankRow[],
    scopeText = "",
    selectedKey: string | null = null,
  ): void {
    this.scopeLabel.textContent = scopeText;

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
      rowElement.addEventListener("click", () => {
        const rowKey = rowElement.dataset.rowKey;

        if (rowKey) {
          this.onRowSelect?.(rowKey);
        }
      });
      rowElement.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        const rowKey = rowElement.dataset.rowKey;

        if (rowKey) {
          this.onRowSelect?.(rowKey);
        }
      });
      this.body.append(rowElement);
      this.rowPool.push(rowElement);
    }

    this.rowPool.forEach((rowElement, index) => {
      const row = rows[index];
      rowElement.hidden = !row;

      if (!row) {
        return;
      }

      const rankDirection =
        row.rankMarker === "▲"
          ? "up"
          : row.rankMarker === "▼"
            ? "down"
            : "flat";
      const priceDirection =
        row.priceChangePercent >= 0 ? "price-up" : "price-down";
      const newsState =
        row.newsTone === "positive"
          ? "news-positive"
          : row.newsTone === "negative"
            ? "news-negative"
            : "no-news";
      const selectable = Boolean(this.onRowSelect);
      const selected = selectedKey === row.key;
      rowElement.className =
        `mms-terminal-row role-${row.roleLabel.toLowerCase()} motion-${rankDirection} ${priceDirection} ${newsState}` +
        `${selectable ? " selectable" : ""}${selected ? " selected" : ""}`;
      rowElement.dataset.rowKey = row.key;
      rowElement.tabIndex = selectable ? 0 : -1;
      rowElement.setAttribute("aria-selected", selected ? "true" : "false");
      rowElement.title = selectable ? `${row.label} 선택 차트 보기` : row.label;
      rowElement.style.setProperty("--icon-color", getMarketIconColor(row.key));
      rowElement.style.setProperty(
        "--motion-offset",
        `${getRankMotionOffset(row)}px`,
      );
      setCell(
        rowElement,
        ".mms-market-name",
        `${row.roleLabel} ${row.rank > 0 ? `${row.rankMarker}${row.rank} ` : ""}${fitMarketLabel(row.label, getMarketLabelMaxLength(row))}`,
      );
      setMarketNewsLabel(rowElement, row);
      setCell(
        rowElement,
        ".mms-market-now",
        formatCompactPrice(row.currentPrice),
      );
      setCell(
        rowElement,
        ".mms-market-avg",
        formatCompactPrice(row.averageEntryPrice),
      );
      setCell(
        rowElement,
        ".mms-market-change",
        formatPercent(row.priceChangePercent),
      );
      setCell(
        rowElement,
        ".mms-market-value",
        formatCompactNumber(row.fictionalTradeValue),
      );
    });
  }

  updateDetail(row: MarketBoardRankRow | null, currentDay: number): void {
    if (!this.detail) {
      return;
    }

    const title = this.detail.querySelector<HTMLElement>(
      ".mms-market-detail-title",
    );
    const meta = this.detail.querySelector<HTMLElement>(
      ".mms-market-detail-meta",
    );
    const detailNote = this.detail.querySelector<HTMLElement>(
      ".mms-market-detail-note",
    );
    const rankSignal = this.detail.querySelector<HTMLElement>(
      ".mms-market-signal-rank",
    );
    const moveSignal = this.detail.querySelector<HTMLElement>(
      ".mms-market-signal-move",
    );
    const newsSignal = this.detail.querySelector<HTMLElement>(
      ".mms-market-signal-news",
    );
    const flowSignal = this.detail.querySelector<HTMLElement>(
      ".mms-market-signal-flow",
    );

    if (!row) {
      if (title) {
        title.textContent = "선택 종목 없음";
      }
      if (meta) {
        meta.textContent = "";
      }
      if (detailNote) {
        detailNote.textContent = "";
      }
      setMarketDetailSignal(rankSignal, "", "neutral");
      setMarketDetailSignal(moveSignal, "", "neutral");
      setMarketDetailSignal(newsSignal, "", "neutral");
      setMarketDetailSignal(flowSignal, "", "neutral");
      return;
    }

    const day = Math.max(1, Math.min(5, currentDay));
    this.detail.classList.toggle("price-up", row.priceChangePercent >= 0);
    this.detail.classList.toggle("price-down", row.priceChangePercent < 0);

    if (title) {
      title.textContent = `${row.roleLabel} ${fitMarketLabel(row.label, 16)}`;
    }

    if (meta) {
      meta.textContent = `LIVE ${formatPercent(row.priceChangePercent)} / D${day}/5 / VALUE ${formatCompactNumber(
        row.fictionalTradeValue,
      )}`;
    }

    setMarketDetailSignal(rankSignal, `RANK #${row.rank}`, "neutral");
    setMarketDetailSignal(
      moveSignal,
      getMarketRankMoveSignal(row),
      getMarketRankMoveTone(row),
    );
    setMarketDetailSignal(
      newsSignal,
      getMarketNewsLabel(row) ?? "뉴스 중립",
      row.newsTone ?? "neutral",
    );
    setMarketDetailSignal(
      flowSignal,
      row.priceChangePercent >= 0 ? "흐름 상승" : "흐름 하락",
      row.priceChangePercent >= 0 ? "positive" : "negative",
    );

    if (detailNote) {
      detailNote.textContent = `NOW ${formatCompactPrice(row.currentPrice)} / AVG ${formatCompactPrice(
        row.averageEntryPrice,
      )} / CHG ${formatPercent(row.priceChangePercent)}`;
    }
  }
}

type MarketDetailSignalTone = "positive" | "negative" | "neutral";

function setMarketDetailSignal(
  element: HTMLElement | null,
  value: string,
  tone: MarketDetailSignalTone,
): void {
  if (!element) {
    return;
  }

  element.hidden = value.length === 0;
  element.textContent = value;
  element.classList.toggle("positive", tone === "positive");
  element.classList.toggle("negative", tone === "negative");
  element.classList.toggle("neutral", tone === "neutral");
}

function getMarketRankMoveSignal(row: MarketBoardRankRow): string {
  if (!row.previousRank) {
    return "MOVE 신규";
  }

  const rankDelta = row.previousRank - row.rank;

  if (rankDelta > 0) {
    return `MOVE +${rankDelta}`;
  }

  if (rankDelta < 0) {
    return `MOVE -${Math.abs(rankDelta)}`;
  }

  return "MOVE 유지";
}

function getMarketRankMoveTone(row: MarketBoardRankRow): MarketDetailSignalTone {
  if (!row.previousRank) {
    return "neutral";
  }

  const rankDelta = row.previousRank - row.rank;

  if (rankDelta > 0) {
    return "positive";
  }

  if (rankDelta < 0) {
    return "negative";
  }

  return "neutral";
}

function setMarketNewsLabel(
  rowElement: HTMLElement,
  row: MarketBoardRankRow,
): void {
  const nameCell = rowElement.querySelector<HTMLElement>(".mms-market-name");

  if (!nameCell) {
    return;
  }

  const label = getMarketNewsLabel(row);

  if (label) {
    nameCell.dataset.newsLabel = label;
    return;
  }

  delete nameCell.dataset.newsLabel;
}

function getMarketNewsLabel(row: MarketBoardRankRow): string | null {
  if (!row.newsTone || row.newsBadge === "-") {
    return null;
  }

  const scope =
    row.newsBadge === "asset"
      ? "종목"
      : row.newsBadge === "sector"
        ? "섹터"
        : row.newsBadge === "market"
          ? "시장"
          : "";
  const tone = row.newsTone === "positive" ? "호재" : "악재";

  return `${scope}${tone}`;
}

function getMarketLabelMaxLength(row: MarketBoardRankRow): number {
  return row.newsTone ? 10 : 14;
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

function createOrderBookRows(
  parent: HTMLElement,
  count: number,
): HTMLDivElement[] {
  return Array.from({ length: count }, () => {
    const row = document.createElement("div");
    row.className = "mms-orderbook-row";
    row.innerHTML =
      `<span class="mms-orderbook-depth"></span>` +
      `<span class="mms-orderbook-wall-meter"><span class="mms-orderbook-wall-fill"></span></span>` +
      `<span class="mms-orderbook-price"></span>` +
      `<span class="mms-orderbook-size"></span>` +
      `<span class="mms-orderbook-action"></span>`;
    parent.append(row);
    return row;
  });
}

function updateOrderBookRows(
  rows: readonly HTMLDivElement[],
  levels: readonly OrderBookOverlayLevel[],
  side: "ask" | "bid",
  openingPrice: number,
  maxDepth: number,
  wallActions: readonly OrderBookOverlayWallAction[],
): void {
  rows.forEach((rowElement, index) => {
    const level = levels[index];

    if (!level) {
      hideOrderBookRow(rowElement);
      return;
    }

    const depth = side === "ask" ? level.askDepth : level.bidDepth;
    const price = openingPrice * (1 + level.priceChangePercent / 100);
    const wallAction = wallActions.find(
      (action) =>
        action.offsetPercent === level.offsetPercent &&
        ((side === "ask" && action.side === "sell") ||
          (side === "bid" && action.side === "buy")),
    );

    if (!wallAction) {
      hideOrderBookRow(rowElement);
      return;
    }

    const previousDepth = Number(rowElement.dataset.targetDepth ?? depth);
    const previousWallKey = rowElement.dataset.wallKey ?? "";
    const wallKey = `${wallAction.side}:${wallAction.priceChangePercent}`;
    const wasActive =
      rowElement.dataset.wallActive === "true" && previousWallKey === wallKey;

    rowElement.hidden = false;
    updateOrderBookRowBaseClass(rowElement, side);
    rowElement.dataset.wallKey = wallKey;
    rowElement.dataset.targetDepth = `${depth}`;
    setCell(rowElement, ".mms-orderbook-price", formatCompactPrice(price));
    animateOrderBookDepth(rowElement, Math.max(0.05, depth / maxDepth));
    animateOrderBookSize(rowElement, Math.round(depth * 13));
    updateOrderBookRowAction(rowElement, wallAction);
    updateOrderBookWallTransitionCues(
      rowElement,
      wallAction,
      previousDepth,
      depth,
      wasActive,
    );
  });
}

function updateOrderBookRowAction(
  rowElement: HTMLDivElement,
  action: OrderBookOverlayWallAction,
): void {
  const label = action.statusLabel || action.label;
  const wallDepthRatio = getOrderBookWallDepthRatio(action);

  rowElement.dataset.wallSide = action.side;
  rowElement.dataset.wallOffset = `${action.offsetPercent}`;
  rowElement.dataset.wallPriceChangePercent = `${action.priceChangePercent}`;
  rowElement.dataset.wallDisabled = action.disabled ? "true" : "false";
  rowElement.dataset.wallActive = action.active ? "true" : "false";
  rowElement.dataset.wallDepthRatio = `${wallDepthRatio}`;
  rowElement.dataset.wallDepthTone = action.remainingDepthTone ?? "";
  rowElement.dataset.wallTimeTone = action.remainingTimeTone ?? "";
  rowElement.dataset.wallOutcomeTone = action.recentOutcomeTone ?? "";
  rowElement.dataset.wallRemainingSec = `${Math.max(0, action.remainingActiveSec ?? 0)}`;
  rowElement.dataset.wallOutcomeReserve = `${Math.max(0, action.recentOutcomeReserveBudget ?? 0)}`;
  rowElement.dataset.wallRemainingDepth = `${Math.max(0, action.remainingDepthBoost ?? 0)}`;
  rowElement.dataset.wallRemainingReserve = `${Math.max(0, action.remainingReservedBudget ?? 0)}`;
  rowElement.style.setProperty("--wall-depth-ratio", `${wallDepthRatio}`);
  rowElement.classList.toggle("wall-disabled", action.disabled);
  rowElement.classList.toggle("wall-active", action.active);
  rowElement.classList.toggle(
    "wall-depth-low",
    action.remainingDepthTone === "low",
  );
  rowElement.classList.toggle(
    "wall-expiring",
    action.remainingTimeTone === "expiring",
  );
  rowElement.classList.toggle(
    "wall-expired-recent",
    action.recentOutcomeTone === "expired",
  );
  rowElement.classList.toggle(
    "wall-cooldown",
    action.cooldownRemainingSec > 0 && !action.active,
  );
  rowElement.classList.toggle(
    "wall-state-visible",
    action.active && wallDepthRatio > 0,
  );
  rowElement.title = getOrderBookWallDetailedTitle(label, action);
  setCell(rowElement, ".mms-orderbook-action", label);
}

function getOrderBookWallDepthRatio(
  action: OrderBookOverlayWallAction,
): number {
  if (
    !action.active ||
    action.initialDepthBoost === undefined ||
    action.initialDepthBoost <= 0
  ) {
    return 0;
  }

  return clampDepthScale(
    (action.remainingDepthBoost ?? 0) / action.initialDepthBoost,
  );
}

function getOrderBookWallDetailedTitle(
  label: string,
  action: OrderBookOverlayWallAction,
): string {
  if (
    !action.active ||
    action.initialDepthBoost === undefined ||
    action.initialReservedBudget === undefined
  ) {
    if (action.recentOutcomeTone === "expired") {
      return `${label} · 최근 만료 · 환급 ${formatNumber(
        Math.max(0, action.recentOutcomeReserveBudget ?? 0),
      )}B · 방어선 해제`;
    }

    return label;
  }

  const remainingDepth = Math.max(0, action.remainingDepthBoost ?? 0);
  const remainingReserve = Math.max(0, action.remainingReservedBudget ?? 0);
  const toneLabel = action.remainingDepthTone === "low" ? " · 잔량 낮음" : "";
  const timeToneLabel =
    action.remainingTimeTone === "expiring" ? " · 만료 임박" : "";
  const timeLabel =
    action.remainingActiveSec !== undefined &&
    action.totalActiveSec !== undefined
      ? ` · 남은 시간 ${Math.ceil(Math.max(0, action.remainingActiveSec))}s/${Math.ceil(
          action.totalActiveSec,
        )}s`
      : "";

  return `${label}${toneLabel}${timeToneLabel}${timeLabel} · 남은 depth ${formatNumber(remainingDepth)}/${formatNumber(action.initialDepthBoost)} · 환급 ${formatNumber(
    remainingReserve,
  )}B/${formatNumber(action.initialReservedBudget)}B`;
}

function hideOrderBookRow(rowElement: HTMLDivElement): void {
  rowElement.hidden = true;
  rowElement.dataset.wallActive = "false";
  rowElement.classList.remove(
    "wall-active",
    "wall-disabled",
    "wall-cooldown",
    "wall-state-visible",
    "wall-depth-low",
    "wall-expiring",
    "wall-expired-recent",
    "wall-activated",
    "wall-depth-growing",
    "wall-depth-melting",
  );
  rowElement.style.setProperty("--wall-depth-ratio", "0");
}

function updateOrderBookRowBaseClass(
  rowElement: HTMLDivElement,
  side: "ask" | "bid",
): void {
  rowElement.classList.add("mms-orderbook-row");
  rowElement.classList.toggle("ask", side === "ask");
  rowElement.classList.toggle("bid", side === "bid");
}

function updateOrderBookWallTransitionCues(
  rowElement: HTMLDivElement,
  action: OrderBookOverlayWallAction,
  previousDepth: number,
  nextDepth: number,
  wasActive: boolean,
): void {
  if (!action.active) {
    return;
  }

  if (!wasActive) {
    restartOrderBookTransientClass(rowElement, "wall-activated", 900);
    restartOrderBookTransientClass(rowElement, "wall-depth-growing", 760);
    return;
  }

  if (!Number.isFinite(previousDepth)) {
    return;
  }

  if (nextDepth > previousDepth + 1) {
    restartOrderBookTransientClass(rowElement, "wall-depth-growing", 760);
    return;
  }

  if (nextDepth < previousDepth - 1) {
    restartOrderBookTransientClass(rowElement, "wall-depth-melting", 760);
  }
}

const orderBookSizeAnimationFrames = new WeakMap<HTMLDivElement, number>();
const orderBookDepthAnimationFrames = new WeakMap<HTMLDivElement, number>();
const orderBookTransientClassTimers = new WeakMap<
  HTMLDivElement,
  Map<string, number>
>();

function animateOrderBookDepth(
  rowElement: HTMLDivElement,
  targetScale: number,
): void {
  const previousFrame = orderBookDepthAnimationFrames.get(rowElement);

  if (previousFrame !== undefined) {
    cancelAnimationFrame(previousFrame);
  }

  const clampedTargetScale = clampDepthScale(targetScale);
  const currentScale = Number(
    rowElement.dataset.displayDepthScale ?? clampedTargetScale,
  );

  if (
    !Number.isFinite(currentScale) ||
    Math.abs(currentScale - clampedTargetScale) < 0.002
  ) {
    rowElement.dataset.displayDepthScale = `${clampedTargetScale}`;
    rowElement.style.setProperty("--depth-scale", `${clampedTargetScale}`);
    return;
  }

  const startedAt = performance.now();
  const growing = clampedTargetScale > currentScale;
  const durationMs = growing ? 820 : 620;
  const updateFrame = (time: number): void => {
    const progress = Math.min(1, (time - startedAt) / durationMs);
    const easedProgress = growing
      ? easeOutQuart(progress)
      : easeInOutCubic(progress);
    const displayScale = clampDepthScale(
      currentScale + (clampedTargetScale - currentScale) * easedProgress,
    );

    rowElement.dataset.displayDepthScale = `${displayScale}`;
    rowElement.style.setProperty("--depth-scale", `${displayScale}`);

    if (progress < 1) {
      orderBookDepthAnimationFrames.set(
        rowElement,
        requestAnimationFrame(updateFrame),
      );
      return;
    }

    orderBookDepthAnimationFrames.delete(rowElement);
  };

  orderBookDepthAnimationFrames.set(
    rowElement,
    requestAnimationFrame(updateFrame),
  );
}

function animateOrderBookSize(
  rowElement: HTMLDivElement,
  targetSize: number,
): void {
  const cell = rowElement.querySelector<HTMLElement>(".mms-orderbook-size");

  if (!cell) {
    return;
  }

  const previousFrame = orderBookSizeAnimationFrames.get(rowElement);

  if (previousFrame !== undefined) {
    cancelAnimationFrame(previousFrame);
  }

  const currentSize = Number(rowElement.dataset.displaySize ?? targetSize);

  if (!Number.isFinite(currentSize) || Math.abs(currentSize - targetSize) < 1) {
    rowElement.dataset.displaySize = `${targetSize}`;
    cell.textContent = targetSize.toLocaleString("ko-KR");
    return;
  }

  const startedAt = performance.now();
  const durationMs = Math.abs(targetSize - currentSize) > 850 ? 760 : 430;
  const updateFrame = (time: number): void => {
    const progress = Math.min(1, (time - startedAt) / durationMs);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const displaySize = Math.round(
      currentSize + (targetSize - currentSize) * easedProgress,
    );

    rowElement.dataset.displaySize = `${displaySize}`;
    cell.textContent = displaySize.toLocaleString("ko-KR");

    if (progress < 1) {
      orderBookSizeAnimationFrames.set(
        rowElement,
        requestAnimationFrame(updateFrame),
      );
      return;
    }

    orderBookSizeAnimationFrames.delete(rowElement);
  };

  orderBookSizeAnimationFrames.set(
    rowElement,
    requestAnimationFrame(updateFrame),
  );
}

function restartOrderBookTransientClass(
  rowElement: HTMLDivElement,
  className: string,
  durationMs: number,
): void {
  let timers = orderBookTransientClassTimers.get(rowElement);

  if (!timers) {
    timers = new Map<string, number>();
    orderBookTransientClassTimers.set(rowElement, timers);
  }

  const previousTimer = timers.get(className);

  if (previousTimer !== undefined) {
    window.clearTimeout(previousTimer);
  }

  rowElement.classList.remove(className);
  void rowElement.offsetWidth;
  rowElement.classList.add(className);

  const timer = window.setTimeout(() => {
    rowElement.classList.remove(className);
    timers?.delete(className);
  }, durationMs);
  timers.set(className, timer);
}

function cancelOrderBookRowAnimations(rowElement: HTMLDivElement): void {
  const sizeFrame = orderBookSizeAnimationFrames.get(rowElement);
  const depthFrame = orderBookDepthAnimationFrames.get(rowElement);
  const transientTimers = orderBookTransientClassTimers.get(rowElement);

  if (sizeFrame !== undefined) {
    cancelAnimationFrame(sizeFrame);
  }

  if (depthFrame !== undefined) {
    cancelAnimationFrame(depthFrame);
  }

  transientTimers?.forEach((timer) => window.clearTimeout(timer));
  transientTimers?.clear();
}

function clampDepthScale(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function easeOutQuart(value: number): number {
  return 1 - Math.pow(1 - value, 4);
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function positionOverlayElement(
  scene: Phaser.Scene,
  element: HTMLElement,
  bounds: GameOverlayBounds,
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
  element.style.setProperty(
    "--mms-overlay-scale",
    `${Math.min(scaleX, scaleY)}`,
  );

  return { width, height };
}

function createReferenceLineOptions(
  price: number,
  color: string,
  title: string,
) {
  return {
    price,
    color,
    lineWidth: 1 as const,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: false,
    title,
  };
}

function chartIndexTime(index: number): UTCTimestamp {
  return Math.max(1, Math.round(index + 1)) as UTCTimestamp;
}

function dayChartTime(day: number): UTCTimestamp {
  return Math.max(1, Math.round(day)) as UTCTimestamp;
}

function roundChartPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatChartPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatPriceChartTick(
  time: Time,
  _tickMarkType: TickMarkType,
  _locale: string,
  liveTickSeconds: ReadonlyMap<number, number>,
): string {
  const timeValue = getChartTimeValue(time);

  const elapsedSec = Math.max(
    0,
    Math.round(liveTickSeconds.get(timeValue) ?? timeValue - 1),
  );
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = `${elapsedSec % 60}`.padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getChartTimeValue(time: Time): number {
  return typeof time === "number" ? time : 0;
}

function isChartHistogramData(data: unknown): data is HistogramData<Time> {
  if (!data || typeof data !== "object") {
    return false;
  }

  return typeof (data as { readonly value?: unknown }).value === "number";
}

function formatVolumeTooltipValue(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}

function setCell(
  rowElement: HTMLElement,
  selector: string,
  value: string,
): void {
  const cell = rowElement.querySelector<HTMLElement>(selector);

  if (cell) {
    cell.textContent = value;
  }
}

function setTelemetryTone(
  element: HTMLElement,
  tone: IntradayTelemetryTone,
): void {
  element.classList.toggle("positive", tone === "positive");
  element.classList.toggle("negative", tone === "negative");
  element.classList.toggle("warning", tone === "warning");
  element.classList.toggle("neutral", tone === "neutral");
}

function fitMarketLabel(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}.` : value;
}

function getMarketIconColor(key: string): string {
  const palette = [
    "#2dd4bf",
    "#7df3e7",
    "#7fb4c8",
    "#ff6677",
    "#b994d1",
    "#8bd3ff",
    "#a8c0c4",
    "#8bd3ff",
  ];
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
