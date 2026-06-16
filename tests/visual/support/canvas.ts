import { expect, type Locator, type Page } from "@playwright/test";

export async function resetBrowserState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();

    let uuidCounter = 0;
    const createDeterministicUuid = () => {
      uuidCounter += 1;
      return `00000000-0000-4000-8000-${uuidCounter.toString().padStart(12, "0")}`;
    };

    try {
      Object.defineProperty(Crypto.prototype, "randomUUID", {
        configurable: true,
        value: createDeterministicUuid,
      });
    } catch {
      try {
        Object.defineProperty(crypto, "randomUUID", {
          configurable: true,
          value: createDeterministicUuid,
        });
      } catch {
        // If the browser locks crypto, the app still works; snapshots may just be less deterministic.
      }
    }
  });
}

export async function seedSavedRunResumeState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      "mms.currentRun.v1",
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-16T03:40:00.000Z",
        data: {
          gameMode: "free",
          runState: {
            runId: "run_visual_saved_resume",
            runSeed: "visual-saved-resume",
            runStatus: "active",
            phase: "morning_news",
            currentDay: 3,
            selectedSectorId: "energy_grid",
            selectedAssetId: "energy_grid_02",
            runAssetProfiles: {
              food_agri: {
                food_agri_01: "stable",
                food_agri_02: "standard",
                food_agri_03: "high_risk",
              },
              energy_grid: {
                energy_grid_01: "stable",
                energy_grid_02: "standard",
                energy_grid_03: "high_risk",
              },
              bio_trial: {
                bio_trial_01: "stable",
                bio_trial_02: "standard",
                bio_trial_03: "high_risk",
              },
              automation_ai: {
                automation_ai_01: "stable",
                automation_ai_02: "standard",
                automation_ai_03: "high_risk",
              },
              chip_equipment: {
                chip_equipment_01: "stable",
                chip_equipment_02: "standard",
                chip_equipment_03: "high_risk",
              },
              payment_fintech: {
                payment_fintech_01: "stable",
                payment_fintech_02: "standard",
                payment_fintech_03: "high_risk",
              },
              media_game: {
                media_game_01: "stable",
                media_game_02: "standard",
                media_game_03: "high_risk",
              },
              meme_theme: {
                meme_theme_01: "stable",
                meme_theme_02: "standard",
                meme_theme_03: "high_risk",
              },
            },
            budget: 86,
            cumulativeProfit: 14.8,
            holdingRatio: 18,
            averageEntryPrice: 10000,
            lastClosePrice: 10460,
            surveillance: 31,
            socialCost: 5,
            autoCards: [{ cardId: "price_support", level: 1 }],
            marketAftereffects: ["high_profit_attention"],
            dayResults: ["안정 운용", "위험 성공"],
            failedReason: null,
          },
        },
      }),
    );
  });
}

export async function seedLocalRecordSnapshotState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      "mms.recentFinal.v1",
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-16T05:10:00.000Z",
        data: {
          finalGrade: "A",
          baseFinalGrade: "A",
          cumulativeProfit: 48.6,
          finalSurveillance: 22,
          finalSurveillanceGrade: "A",
          averageSurveillanceGrade: "B",
          successfulDays: 4,
          finalBudget: 116,
          finalHoldingBand: {
            id: "balanced",
            displayName: "균형 보유",
            settlementRisk: false,
          },
          socialCost: 9,
          consideredMetrics: [
            "cumulativeProfit",
            "finalSurveillanceGrade",
            "averageSurveillanceGrade",
            "successfulDays",
            "finalBudget",
            "finalHoldingRatio",
            "socialCost",
          ],
          forcedFailure: false,
          failureReason: null,
        },
      }),
    );
    localStorage.setItem(
      "mms.bestRecord.v1",
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-16T05:10:00.000Z",
        data: {
          finalGrade: "S",
          cumulativeProfit: 63.2,
          finalSurveillance: 18,
        },
      }),
    );
  });
}

export async function expectCanvasReady(canvas: Locator): Promise<void> {
  const phaserCanvas = canvas.first();

  await expect(phaserCanvas).toBeVisible();
  await expect(phaserCanvas).toHaveJSProperty("width", 1280);
  await expect(phaserCanvas).toHaveJSProperty("height", 720);
  await expect
    .poll(
      async () =>
        phaserCanvas.evaluate((node) => {
          const canvasNode = node as HTMLCanvasElement;
          const context = canvasNode.getContext("2d");

          if (!context) {
            return false;
          }

          const { data } = context.getImageData(
            0,
            0,
            canvasNode.width,
            canvasNode.height,
          );
          let nonBackgroundSamples = 0;

          for (let index = 0; index < data.length; index += 4 * 256) {
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const alpha = data[index + 3];
            const isBackground =
              Math.abs(red - 17) <= 2 &&
              Math.abs(green - 20) <= 2 &&
              Math.abs(blue - 23) <= 2;

            if (alpha > 0 && !isBackground) {
              nonBackgroundSamples += 1;
            }
          }

          return nonBackgroundSamples > 40;
        }),
      { timeout: 5000 },
    )
    .toBe(true);
}

export async function prepareIntradaySurveillanceAlertState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(state.openingPrice * 1.058);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      cumulativeProfit: 18.4,
      budget: 76,
      holdingRatio: 42,
      averageEntryPrice: Math.round(state.openingPrice * 1.014),
      surveillance: 88,
      socialCost: 26,
      dayResults: ["위험 성공"]
    };
    gameSession.surveillanceHistory = [38];
    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 72,
      currentPrice,
      priceChangePercent: 5.8,
      priceDeltaPerTick: 0.3,
      budget: 76,
      holdingRatio: 42,
      averageEntryPrice: Math.round(state.openingPrice * 1.014),
      personalParticipation: 78,
      marketLiquidity: 46,
      surveillance: 88,
      volatility: 72,
      madness: 68,
      pendingSocialCostDelta: 3,
      marketPressure: 45,
      retailSwarmState: "warning",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 32 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 84 }
      ],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 190 },
      { elapsedSec: 34, priceChangePercent: 2.4, fictionalVolume: 460 },
      { elapsedSec: 72, priceChangePercent: 5.8, fictionalVolume: 820 },
      { elapsedSec: 108, priceChangePercent: 5.3, fictionalVolume: 760 }
    ];
    gameSession.autoCardRewardIndex = 2;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareIntradayCrashBufferAlertState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const priceChangePercent = dayState.crashLine + 3.2;
    const currentPrice = Math.round(state.openingPrice * (1 + priceChangePercent / 100));
    const holdingRatio = 8;
    const averageEntryPrice = Math.round(state.openingPrice * 1.012);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      cumulativeProfit: -6.8,
      budget: 84,
      holdingRatio,
      averageEntryPrice,
      surveillance: 42,
      socialCost: 18,
      dayResults: ["안정 운용"]
    };
    gameSession.surveillanceHistory = [28];
    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 64,
      currentPrice,
      priceChangePercent,
      priceDeltaPerTick: -0.8,
      budget: 84,
      holdingRatio,
      averageEntryPrice,
      heldUnits: Math.round((state.fictionalFloatUnits * holdingRatio) / 100),
      personalParticipation: 66,
      marketLiquidity: 38,
      surveillance: 42,
      volatility: 82,
      madness: 74,
      pendingSocialCostDelta: 2,
      marketPressure: -54,
      retailSwarmState: "panic",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "collapse_risk_notice", choiceType: "stable", elapsedSec: 44 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 92 }
      ],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 190 },
      { elapsedSec: 28, priceChangePercent: -4.1, fictionalVolume: 520 },
      { elapsedSec: 64, priceChangePercent: -10.6, fictionalVolume: 880 },
      { elapsedSec: 116, priceChangePercent, fictionalVolume: 1120 }
    ];
    gameSession.autoCardRewardIndex = 2;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareFinalSettlementState(page: Page): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const runLengthDays = gameSession.getRunLengthDays();

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: runLengthDays,
      cumulativeProfit: 44,
      budget: 112,
      holdingRatio: 28,
      surveillance: 24,
      socialCost: 14,
      dayResults: ["완전 성공", "안정 운용", "위험 성공", "안정 운용"]
    };
    gameSession.surveillanceHistory = [14, 22, 18, 27];
    gameSession.intradayState = {
      ...intradayState,
      priceChangePercent: 9.8,
      surveillance: 24,
      budget: 112,
      holdingRatio: 28,
      personalParticipation: 45,
      volatility: 42,
      pendingSocialCostDelta: 0,
      marketPressure: 18,
      retailSwarmState: "interest"
    };
  })()`);
}

export async function prepareSocialCostFinalSettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const runLengthDays = gameSession.getRunLengthDays();
    const currentPrice = Math.round(intradayState.openingPrice * 1.088);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: runLengthDays,
      cumulativeProfit: 39.2,
      budget: 108,
      holdingRatio: 28,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.02),
      lastClosePrice: null,
      surveillance: 34,
      socialCost: 58,
      dayResults: ["완전 성공", "안정 운용", "위험 성공", "안정 운용"]
    };
    gameSession.surveillanceHistory = [22, 31, 28, 36];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 10,
      currentPrice,
      priceChangePercent: 8.8,
      surveillance: 34,
      budget: 108,
      holdingRatio: 28,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.02),
      personalParticipation: 48,
      volatility: 44,
      pendingSocialCostDelta: 0,
      marketPressure: 22,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 44, priceChangePercent: 2.6, fictionalVolume: 340 },
      { elapsedSec: 116, priceChangePercent: 6.2, fictionalVolume: 520 },
      { elapsedSec: 170, priceChangePercent: 8.8, fictionalVolume: 610 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareBudgetPreservationFinalSettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const runLengthDays = gameSession.getRunLengthDays();
    const currentPrice = Math.round(intradayState.openingPrice * 1.072);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: runLengthDays,
      cumulativeProfit: 31.5,
      budget: 38,
      holdingRatio: 26,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.01),
      lastClosePrice: null,
      surveillance: 32,
      socialCost: 24,
      dayResults: ["안정 운용", "비용 과다", "안정 운용", "위험 성공"]
    };
    gameSession.surveillanceHistory = [18, 26, 30, 34];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 8,
      currentPrice,
      priceChangePercent: 7.2,
      surveillance: 32,
      budget: 38,
      holdingRatio: 26,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.01),
      personalParticipation: 54,
      volatility: 47,
      pendingSocialCostDelta: 0,
      marketPressure: 28,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 42, priceChangePercent: 1.8, fictionalVolume: 360 },
      { elapsedSec: 114, priceChangePercent: 5.4, fictionalVolume: 590 },
      { elapsedSec: 172, priceChangePercent: 7.2, fictionalVolume: 760 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareHighHoldingDaySettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(intradayState.openingPrice * 1.118);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      cumulativeProfit: 18,
      budget: 92,
      holdingRatio: 68,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.02),
      lastClosePrice: null,
      surveillance: 66,
      socialCost: 18,
      dayResults: ["위험 성공"]
    };
    gameSession.surveillanceHistory = [38];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 16,
      currentPrice,
      priceChangePercent: 11.8,
      budget: 92,
      holdingRatio: 68,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.02),
      personalParticipation: 82,
      surveillance: 66,
      volatility: 79,
      pendingSocialCostDelta: 2,
      marketPressure: 54,
      retailSwarmState: "warning",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 46, priceChangePercent: 3.2, fictionalVolume: 420 },
      { elapsedSec: 104, priceChangePercent: 8.7, fictionalVolume: 720 },
      { elapsedSec: 164, priceChangePercent: 11.8, fictionalVolume: 960 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareBudgetPreservationDaySettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(intradayState.openingPrice * 1.086);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 3,
      cumulativeProfit: 7.4,
      budget: 34,
      holdingRatio: 22,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.01),
      lastClosePrice: null,
      surveillance: 46,
      socialCost: 22,
      dayResults: ["안정 운용", "비용 과다"]
    };
    gameSession.surveillanceHistory = [24, 39];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 12,
      currentPrice,
      priceChangePercent: 8.6,
      budget: 34,
      holdingRatio: 22,
      averageEntryPrice: Math.round(intradayState.openingPrice * 1.01),
      personalParticipation: 57,
      surveillance: 46,
      volatility: 52,
      pendingSocialCostDelta: 1,
      marketPressure: 33,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeManualActionEffects: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 38, priceChangePercent: 2.1, fictionalVolume: 380 },
      { elapsedSec: 108, priceChangePercent: 6.5, fictionalVolume: 620 },
      { elapsedSec: 168, priceChangePercent: 8.6, fictionalVolume: 790 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareRunFailureFinalSettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const failedPriceChangePercent = -8.4;
    const currentPrice = Math.round(intradayState.openingPrice * (1 + failedPriceChangePercent / 100));

    gameSession.runState = {
      ...runState,
      phase: "final_settlement",
      runStatus: "failed",
      currentDay: 3,
      cumulativeProfit: 12.4,
      budget: 42,
      holdingRatio: 34,
      averageEntryPrice: intradayState.averageEntryPrice,
      lastClosePrice: currentPrice,
      surveillance: 100,
      socialCost: 18,
      dayResults: ["안정 운용", "위험 성공"],
      failedReason: "surveillance reached 100"
    };
    gameSession.surveillanceHistory = [24, 58, 100];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 78,
      currentPrice,
      priceChangePercent: failedPriceChangePercent,
      budget: 42,
      holdingRatio: 34,
      personalParticipation: 84,
      surveillance: 100,
      volatility: 86,
      pendingSocialCostDelta: 4,
      marketPressure: -36,
      retailSwarmState: "panic",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 42, priceChangePercent: 5.2, fictionalVolume: 520 },
      { elapsedSec: 88, priceChangePercent: 2.8, fictionalVolume: 680 },
      { elapsedSec: 102, priceChangePercent: failedPriceChangePercent, fictionalVolume: 980 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareDocumentEventPopupState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { openDocumentEvent } = await import("/src/domain/intraday/documentEvents.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const eventReadyState = {
      ...state,
      timeRemainingSec: 120,
      budget: 30,
      marketLiquidity: 20,
      personalParticipation: 42,
      surveillance: 34,
      volatility: 44,
      marketPressure: 12,
      activeDocumentEventId: null,
      documentEventChoices: [],
      lastDocumentEventElapsedSec: null
    };
    const result = openDocumentEvent(eventReadyState, "liquidity_dryness_report");
    gameSession.intradayState = result.state;
    gameSession.lastDocumentEventMessage = "유동성 경색 보고 opened.";
  })()`);
}

export async function prepareCollapseRiskDocumentEventState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { openDocumentEvent } = await import("/src/domain/intraday/documentEvents.ts");
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const priceChangePercent = dayState.crashLine + 3.4;
    const currentPrice = Math.round(state.openingPrice * (1 + priceChangePercent / 100));
    const eventReadyState = {
      ...state,
      timeRemainingSec: 68,
      currentPrice,
      priceChangePercent,
      priceDeltaPerTick: -0.6,
      budget: 84,
      holdingRatio: 12,
      averageEntryPrice: Math.round(state.openingPrice * 1.012),
      heldUnits: Math.round((state.fictionalFloatUnits * 12) / 100),
      marketLiquidity: 36,
      personalParticipation: 64,
      surveillance: 38,
      volatility: 82,
      madness: 72,
      marketPressure: -48,
      retailSwarmState: "panic",
      activeDocumentEventId: null,
      documentEventChoices: [],
      lastDocumentEventElapsedSec: null
    };

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      cumulativeProfit: -4.2,
      budget: 84,
      holdingRatio: 12,
      averageEntryPrice: Math.round(state.openingPrice * 1.012),
      surveillance: 38,
      socialCost: 12,
      dayResults: ["안정 운용"]
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 190 },
      { elapsedSec: 32, priceChangePercent: -4.8, fictionalVolume: 520 },
      { elapsedSec: 74, priceChangePercent: -11.2, fictionalVolume: 860 },
      { elapsedSec: 112, priceChangePercent, fictionalVolume: 1080 }
    ];

    const result = openDocumentEvent(eventReadyState, "collapse_risk_notice");
    gameSession.intradayState = result.state;
    gameSession.lastDocumentEventMessage = "급락 위험 통지 opened.";
  })()`);
}

export async function prepareAutoCardRewardState(page: Page): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const runState = gameSession.ensureRun();

    gameSession.runState = {
      ...runState,
      autoCards: [{ cardId: "price_support", level: 1 }]
    };
    gameSession.autoCardRewardIndex = 1;
    gameSession.autoCardRewardChoices = [
      { type: "level_up", cardId: "price_support" },
      { type: "new", cardId: "surveillance_buffer" },
      { type: "new", cardId: "settlement_routine" }
    ];
    gameSession.intradayState = {
      ...state,
      isPaused: true,
      timeRemainingSec: 135,
      activeDocumentEventId: null,
      documentEventChoices: []
    };
    gameSession.lastAutoCardRewardMessage = "Auto card reward opened.";
  })()`);
}

export async function prepareAutoCardGrowthPreviewState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const runState = gameSession.ensureRun();

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      budget: 92,
      cumulativeProfit: 11.6,
      holdingRatio: 30,
      surveillance: 36,
      socialCost: 8,
      autoCards: [
        { cardId: "news_amplifier", level: 1 },
        { cardId: "attention_signal", level: 2 }
      ],
      dayResults: ["안정 운용"]
    };
    gameSession.autoCardRewardIndex = 2;
    gameSession.autoCardRewardChoices = [
      { type: "level_up", cardId: "news_amplifier" },
      { type: "level_up", cardId: "attention_signal" },
      { type: "new", cardId: "competition_check" }
    ];
    gameSession.intradayState = {
      ...state,
      isPaused: true,
      timeRemainingSec: 82,
      budget: 92,
      holdingRatio: 30,
      surveillance: 36,
      personalParticipation: 58,
      marketLiquidity: 42,
      volatility: 54,
      marketPressure: 28,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: []
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 42, priceChangePercent: 2.1, fictionalVolume: 320 },
      { elapsedSec: 98, priceChangePercent: 4.4, fictionalVolume: 540 }
    ];
    gameSession.lastAutoCardRewardMessage = "Auto card growth preview opened.";
  })()`);
}

export async function prepareRetailSwarmPanicState(page: Page): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(state.openingPrice * 0.942);

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 118,
      currentPrice,
      priceChangePercent: -5.8,
      marketPressure: -48,
      personalParticipation: 92,
      madness: 88,
      marketLiquidity: 32,
      surveillance: 64,
      volatility: 82,
      competitionPressure: 58,
      retailSwarmState: "panic",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 40, priceChangePercent: 2.4, fictionalVolume: 420 },
      { elapsedSec: 84, priceChangePercent: 3.1, fictionalVolume: 560 },
      { elapsedSec: 118, priceChangePercent: -5.8, fictionalVolume: 760 }
    ];
  })()`);
}

export async function prepareOrderBookWallState(page: Page): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 126,
      priceChangePercent: 0,
      budget: 88,
      holdingRatio: 34,
      marketPressure: -42,
      personalParticipation: 48,
      marketLiquidity: 36,
      surveillance: 38,
      volatility: 52,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 18
      },
      activeOrderBookWallEffects: [
        {
          side: "buy",
          offsetPercent: -1,
          priceChangePercent: wallPriceChangePercent,
          reservedBudget: 10,
          depthBoost: 160,
          remainingReservedBudget: 6,
          remainingDepthBoost: 96,
          remainingSec: 8,
          totalSec: 14
        }
      ],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "58:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -64,
          reserveDelta: -4,
          remainingDepthBoost: 96,
          remainingReservedBudget: 6,
          elapsedSec: 58
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallLowDepthState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 126,
      priceChangePercent: 0,
      budget: 84,
      holdingRatio: 34,
      marketPressure: -58,
      personalParticipation: 52,
      marketLiquidity: 31,
      surveillance: 42,
      volatility: 57,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 16
      },
      activeOrderBookWallEffects: [
        {
          side: "buy",
          offsetPercent: -1,
          priceChangePercent: wallPriceChangePercent,
          reservedBudget: 10,
          depthBoost: 160,
          remainingReservedBudget: 2,
          remainingDepthBoost: 32,
          remainingSec: 5,
          totalSec: 14
        }
      ],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "61:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -128,
          reserveDelta: -8,
          remainingDepthBoost: 32,
          remainingReservedBudget: 2,
          elapsedSec: 61
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallExpiringState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 126,
      priceChangePercent: 0,
      budget: 86,
      holdingRatio: 34,
      marketPressure: -38,
      personalParticipation: 49,
      marketLiquidity: 34,
      surveillance: 40,
      volatility: 54,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 16
      },
      activeOrderBookWallEffects: [
        {
          side: "buy",
          offsetPercent: -1,
          priceChangePercent: wallPriceChangePercent,
          reservedBudget: 10,
          depthBoost: 160,
          remainingReservedBudget: 7,
          remainingDepthBoost: 112,
          remainingSec: 4,
          totalSec: 14
        }
      ],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "60:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -48,
          reserveDelta: -3,
          remainingDepthBoost: 112,
          remainingReservedBudget: 7,
          elapsedSec: 60
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallExpiredState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 124,
      priceChangePercent: 0,
      budget: 93,
      holdingRatio: 34,
      marketPressure: -30,
      personalParticipation: 49,
      marketLiquidity: 34,
      surveillance: 40,
      volatility: 54,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 14
      },
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "60:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -48,
          reserveDelta: -3,
          remainingDepthBoost: 112,
          remainingReservedBudget: 7,
          elapsedSec: 60
        },
        {
          id: "68:expired:buy:-1:2",
          type: "expired",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -112,
          reserveDelta: 7,
          remainingDepthBoost: 0,
          remainingReservedBudget: 0,
          elapsedSec: 68
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallCollapsedState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 121,
      priceChangePercent: 0,
      budget: 76,
      holdingRatio: 31,
      marketPressure: -18,
      personalParticipation: 44,
      marketLiquidity: 31,
      surveillance: 42,
      volatility: 57,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 16
      },
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "59:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -92,
          reserveDelta: -5.8,
          remainingDepthBoost: 68,
          remainingReservedBudget: 4.2,
          elapsedSec: 59
        },
        {
          id: "63:collapsed:buy:-1:2",
          type: "collapsed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -68,
          reserveDelta: -4.2,
          remainingDepthBoost: 0,
          remainingReservedBudget: 0,
          elapsedSec: 63
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallRemovedState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const wallPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 119,
      priceChangePercent: 0,
      budget: 83.4,
      holdingRatio: 32,
      marketPressure: -12,
      personalParticipation: 42,
      marketLiquidity: 34,
      surveillance: 39,
      volatility: 49,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", wallPriceChangePercent)]: 14
      },
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [
        {
          id: "54:formed:buy:-1:0",
          type: "formed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: 160,
          reserveDelta: -10,
          remainingDepthBoost: 160,
          remainingReservedBudget: 10,
          elapsedSec: 54
        },
        {
          id: "58:melted:buy:-1:1",
          type: "melted",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -38.4,
          reserveDelta: -2.4,
          remainingDepthBoost: 121.6,
          remainingReservedBudget: 7.6,
          elapsedSec: 58
        },
        {
          id: "61:removed:buy:-1:2",
          type: "removed",
          side: "buy",
          priceChangePercent: wallPriceChangePercent,
          depthDelta: -121.6,
          reserveDelta: 7.6,
          remainingDepthBoost: 0,
          remainingReservedBudget: 0,
          elapsedSec: 61
        }
      ],
      isPaused: false
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareOrderBookWallBlockedState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getOrderBookWallLevelKey } = await import("/src/domain/balancing/orderBookWallValues.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const cooldownPriceChangePercent = -1;

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 126,
      priceChangePercent: 0,
      budget: 1,
      holdingRatio: 24,
      marketPressure: 6,
      personalParticipation: 34,
      marketLiquidity: 44,
      surveillance: 32,
      volatility: 38,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      orderBookWallCooldowns: {
        ...state.orderBookWallCooldowns,
        [getOrderBookWallLevelKey("buy", cooldownPriceChangePercent)]: 17
      },
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: true
    };
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareIntradayRepositionDeskState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const state = gameSession.intradayState ?? gameSession.startIntraday();

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 1,
      budget: 64,
      holdingRatio: 0,
      averageEntryPrice: null,
      lastClosePrice: null,
      surveillance: 26,
      socialCost: 3,
      dayResults: []
    };
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 112,
      budget: 64,
      holdingRatio: 0,
      heldUnits: 0,
      priceChangePercent: 3.2,
      marketPressure: -18,
      personalParticipation: 58,
      madness: 44,
      marketLiquidity: 48,
      surveillance: 26,
      volatility: 42,
      pendingSocialCostDelta: 1,
      retailSwarmState: "interest",
      activeManualActionEffects: [],
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 42 },
        { eventId: "liquidity_dryness_report", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 44, priceChangePercent: 4.8, fictionalVolume: 420 },
      { elapsedSec: 86, priceChangePercent: 1.6, fictionalVolume: 510 },
      { elapsedSec: 112, priceChangePercent: 3.2, fictionalVolume: 360 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareActiveManualActionProgressState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 146,
      budget: 82,
      holdingRatio: 28,
      priceChangePercent: 5.4,
      marketPressure: 34,
      personalParticipation: 64,
      madness: 52,
      marketLiquidity: 56,
      surveillance: 30,
      volatility: 44,
      activeManualActionEffects: [
        { actionId: "liquidity_supply", remainingSec: 5, totalSec: 8 }
      ],
      manualActionCooldowns: {
        ...state.manualActionCooldowns,
        liquidity_supply: 5
      },
      lastManualActionId: "liquidity_supply",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 42 },
        { eventId: "liquidity_dryness_report", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 38, priceChangePercent: 2.2, fictionalVolume: 340 },
      { elapsedSec: 76, priceChangePercent: 4.6, fictionalVolume: 520 },
      { elapsedSec: 112, priceChangePercent: 5.4, fictionalVolume: 460 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareManualActionUnavailableState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const state = gameSession.intradayState ?? gameSession.startIntraday();

    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 132,
      budget: 1,
      holdingRatio: 24,
      currentPrice: 10380,
      averageEntryPrice: 10000,
      priceChangePercent: 3.8,
      marketPressure: 26,
      personalParticipation: 58,
      madness: 38,
      marketLiquidity: 44,
      surveillance: 42,
      volatility: 36,
      activeManualActionEffects: [],
      manualActionCooldowns: {
        ...state.manualActionCooldowns,
        liquidity_supply: 0,
        price_push: 9,
        overheat_cooldown: 0,
        position_settlement: 0
      },
      lastManualActionId: "price_push",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 42 },
        { eventId: "liquidity_dryness_report", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      orderBookWallCooldowns: {},
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 36, priceChangePercent: 1.4, fictionalVolume: 260 },
      { elapsedSec: 72, priceChangePercent: 2.9, fictionalVolume: 420 },
      { elapsedSec: 108, priceChangePercent: 3.8, fictionalVolume: 380 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareMarketBoardNewsBadgeState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getAssetById, getAssetsBySector } = await import("/src/domain/assets/assetCatalog.ts");
    const { buildMarketBoard } = await import("/src/domain/market/marketBoard.ts");

    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const state = gameSession.intradayState ?? gameSession.startIntraday();
    const selectedAsset = getAssetById(runState.selectedAssetId);
    const sameSectorPeers = getAssetsBySector(selectedAsset.sectorId).filter(
      (asset) => asset.id !== selectedAsset.id
    );
    const negativePeer = sameSectorPeers[0];
    const otherSectorId = selectedAsset.sectorId === "energy_grid" ? "bio_trial" : "energy_grid";
    const morningNewsItems = [
      {
        templateId: "sector_positive_catalyst",
        displayName: "선택 섹터 온기 확산",
        designLabel: "Sector Positive Catalyst",
        role: "Highlights positive abstract attention for the selected fictional sector.",
        target: { type: "sector", sectorId: selectedAsset.sectorId }
      },
      {
        templateId: "sector_negative_catalyst",
        displayName: negativePeer ? negativePeer.displayName + " 공급 지연설" : "동일 섹터 공급 지연설",
        designLabel: "Asset Negative Catalyst",
        role: "Highlights negative abstract pressure for one same-sector fictional asset.",
        target: {
          type: "asset",
          sectorId: selectedAsset.sectorId,
          assetId: negativePeer?.id ?? selectedAsset.id
        }
      },
      {
        templateId: "sector_negative_catalyst",
        displayName: "타 섹터 경고 보고",
        designLabel: "Sector Negative Catalyst",
        role: "Highlights negative abstract pressure for another fictional sector.",
        target: { type: "sector", sectorId: otherSectorId }
      }
    ];
    const nextDayState = {
      ...dayState,
      morningNewsItems,
      morningNews: morningNewsItems[0]
    };

    gameSession.dayState = nextDayState;
    gameSession.marketBoardState = buildMarketBoard(runState, nextDayState);
    gameSession.intradayState = {
      ...state,
      timeRemainingSec: 132,
      priceChangePercent: 4.2,
      currentPrice: 14200,
      budget: 76,
      holdingRatio: 32,
      marketPressure: 36,
      personalParticipation: 54,
      madness: 34,
      marketLiquidity: 62,
      surveillance: 28,
      volatility: 38,
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 42 },
        { eventId: "liquidity_dryness_report", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 36, priceChangePercent: 1.8, fictionalVolume: 340 },
      { elapsedSec: 72, priceChangePercent: 3.4, fictionalVolume: 520 },
      { elapsedSec: 108, priceChangePercent: 4.2, fictionalVolume: 460 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareMorningBriefingNewsScopeState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { getAssetById, getAssetsBySector } = await import("/src/domain/assets/assetCatalog.ts");

    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const selectedAsset = getAssetById(runState.selectedAssetId);
    const sameSectorPeer = getAssetsBySector(selectedAsset.sectorId).find(
      (asset) => asset.id !== selectedAsset.id
    );
    const morningNewsItems = [
      {
        templateId: "sector_positive_catalyst",
        displayName: "선택 섹터 온기 확산",
        designLabel: "Sector Positive Catalyst",
        role: "Highlights positive abstract attention for the selected fictional sector.",
        target: { type: "sector", sectorId: selectedAsset.sectorId }
      },
      {
        templateId: "sector_negative_catalyst",
        displayName: selectedAsset.displayName + " 검증 일정 지연",
        designLabel: "Asset Negative Catalyst",
        role: "Highlights negative abstract pressure for the selected fictional asset.",
        target: {
          type: "asset",
          sectorId: selectedAsset.sectorId,
          assetId: selectedAsset.id
        }
      },
      {
        templateId: "overheat_spread",
        displayName: sameSectorPeer ? sameSectorPeer.displayName + " 관심 급등" : "동일 섹터 관심 급등",
        designLabel: "Asset Positive Catalyst",
        role: "Highlights context pressure for a same-sector fictional asset.",
        target: {
          type: "asset",
          sectorId: selectedAsset.sectorId,
          assetId: sameSectorPeer?.id ?? selectedAsset.id
        }
      }
    ];

    gameSession.dayState = {
      ...dayState,
      morningNewsItems,
      morningNews: morningNewsItems[0]
    };
    gameSession.marketBriefing = null;
  })()`);
}

export async function prepareContractFinalSettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { createContractObservation } = await import("/src/domain/contract/index.ts");
    const { getAssetById } = await import("/src/domain/assets/assetCatalog.ts");

    const mandate = gameSession.startContractRun("contract_defense_energy");
    const asset = getAssetById(mandate.assetId);
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.startIntraday();
    const closePrice = 10180;

    gameSession.runState = {
      ...runState,
      selectedSectorId: asset.sectorId,
      selectedAssetId: asset.id,
      phase: "intraday",
      currentDay: mandate.durationDays,
      cumulativeProfit: 31,
      budget: 106,
      holdingRatio: 30,
      surveillance: 18,
      socialCost: 4,
      dayResults: ["안정 운용", "완전 성공", "안정 운용"]
    };
    gameSession.selectedSectorId = asset.sectorId;
    gameSession.selectedAssetId = asset.id;
    gameSession.surveillanceHistory = [14, 18, 20];
    gameSession.contractObservations = [
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: mandate.referencePrice,
        marketDashboardRank: null,
        marketDashboardValue: 0,
        madness: 0,
        surveillance: 8,
        kind: "contract_start"
      }),
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: 10040,
        marketDashboardRank: 9,
        marketDashboardValue: 78000000,
        madness: 8,
        surveillance: 12,
        kind: "day_close"
      }),
      createContractObservation({
        day: 2,
        elapsedSec: null,
        price: 9950,
        marketDashboardRank: 8,
        marketDashboardValue: 92000000,
        madness: 12,
        surveillance: 15,
        kind: "day_close"
      }),
      createContractObservation({
        day: 3,
        elapsedSec: null,
        price: 10090,
        marketDashboardRank: 7,
        marketDashboardValue: 110000000,
        madness: 15,
        surveillance: 17,
        kind: "day_close"
      }),
      createContractObservation({
        day: 4,
        elapsedSec: 152,
        price: 10140,
        marketDashboardRank: 7,
        marketDashboardValue: 136000000,
        madness: 14,
        surveillance: 18,
        kind: "intraday_tick"
      })
    ];
    gameSession.contractEvaluationResult = null;
    gameSession.contractSettlementResult = null;
    gameSession.contractBudgetSpent = 3.4;
    gameSession.contractActionMistakePenalty = 0;
    gameSession.contractActionEfficiencyBonus = 0;
    gameSession.marketDashboardPlayerRank = 7;
    gameSession.marketDashboardPlayerValue = 136000000;
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 0,
      currentPrice: closePrice,
      priceChangePercent: 1.8,
      budget: 106,
      holdingRatio: 30,
      personalParticipation: 36,
      surveillance: 18,
      volatility: 34,
      marketPressure: 12,
      madness: 14,
      pendingSocialCostDelta: 0,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 140 },
      { elapsedSec: 58, priceChangePercent: 0.6, fictionalVolume: 210 },
      { elapsedSec: 126, priceChangePercent: 1.2, fictionalVolume: 260 },
      { elapsedSec: 180, priceChangePercent: 1.8, fictionalVolume: 300 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareContractFailedFinalSettlementState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { createContractObservation } = await import("/src/domain/contract/index.ts");
    const { getAssetById } = await import("/src/domain/assets/assetCatalog.ts");

    const mandate = gameSession.startContractRun("contract_defense_energy");
    const asset = getAssetById(mandate.assetId);
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.startIntraday();
    const closePrice = 9300;

    gameSession.runState = {
      ...runState,
      selectedSectorId: asset.sectorId,
      selectedAssetId: asset.id,
      phase: "intraday",
      currentDay: mandate.durationDays,
      cumulativeProfit: -4,
      budget: 73,
      holdingRatio: 44,
      surveillance: 46,
      socialCost: 16,
      dayResults: ["위험 운용", "조용한 실패", "위험 운용"]
    };
    gameSession.selectedSectorId = asset.sectorId;
    gameSession.selectedAssetId = asset.id;
    gameSession.surveillanceHistory = [22, 38, 44];
    gameSession.contractObservations = [
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: mandate.referencePrice,
        marketDashboardRank: null,
        marketDashboardValue: 0,
        madness: 0,
        surveillance: 12,
        kind: "contract_start"
      }),
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: 9960,
        marketDashboardRank: 9,
        marketDashboardValue: 62000000,
        madness: 10,
        surveillance: 22,
        kind: "day_close"
      }),
      createContractObservation({
        day: 2,
        elapsedSec: null,
        price: 9810,
        marketDashboardRank: 10,
        marketDashboardValue: 68000000,
        madness: 18,
        surveillance: 34,
        kind: "day_close"
      }),
      createContractObservation({
        day: 3,
        elapsedSec: 124,
        price: 9360,
        marketDashboardRank: 11,
        marketDashboardValue: 84000000,
        madness: 42,
        surveillance: 44,
        kind: "intraday_tick"
      })
    ];
    gameSession.contractEvaluationResult = null;
    gameSession.contractSettlementResult = null;
    gameSession.contractBudgetSpent = 9.6;
    gameSession.contractActionMistakePenalty = 2.2;
    gameSession.contractActionEfficiencyBonus = 0;
    gameSession.lastContractActionFitResult = null;
    gameSession.marketDashboardPlayerRank = 11;
    gameSession.marketDashboardPlayerValue = 84000000;
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 0,
      currentPrice: closePrice,
      priceChangePercent: -7,
      budget: 73,
      holdingRatio: 44,
      personalParticipation: 74,
      surveillance: 46,
      volatility: 68,
      marketPressure: -44,
      madness: 46,
      pendingSocialCostDelta: 0,
      retailSwarmState: "panic",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 150 },
      { elapsedSec: 54, priceChangePercent: -2.4, fictionalVolume: 380 },
      { elapsedSec: 118, priceChangePercent: -5.8, fictionalVolume: 720 },
      { elapsedSec: 180, priceChangePercent: -7, fictionalVolume: 940 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareContractDaySettlementProgressState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { createContractObservation } = await import("/src/domain/contract/index.ts");
    const { getAssetById } = await import("/src/domain/assets/assetCatalog.ts");

    const mandate = gameSession.startContractRun("contract_value_rank_media");
    const asset = getAssetById(mandate.assetId);
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.startIntraday();
    const closePrice = 10760;

    gameSession.runState = {
      ...runState,
      selectedSectorId: asset.sectorId,
      selectedAssetId: asset.id,
      phase: "intraday",
      currentDay: 1,
      cumulativeProfit: 8,
      budget: 92,
      holdingRatio: 42,
      surveillance: 32,
      socialCost: 6,
      dayResults: []
    };
    gameSession.selectedSectorId = asset.sectorId;
    gameSession.selectedAssetId = asset.id;
    gameSession.surveillanceHistory = [];
    gameSession.contractObservations = [
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: mandate.referencePrice,
        marketDashboardRank: null,
        marketDashboardValue: 0,
        madness: 0,
        surveillance: 12,
        kind: "contract_start"
      }),
      createContractObservation({
        day: 1,
        elapsedSec: 118,
        price: 10680,
        marketDashboardRank: 8,
        marketDashboardValue: 320000000,
        madness: 38,
        surveillance: 32,
        kind: "intraday_tick"
      })
    ];
    gameSession.contractEvaluationResult = null;
    gameSession.contractSettlementResult = null;
    gameSession.contractBudgetSpent = 8.2;
    gameSession.contractActionMistakePenalty = 0;
    gameSession.contractActionEfficiencyBonus = 0;
    gameSession.lastContractActionFitResult = null;
    gameSession.marketDashboardPlayerRank = 8;
    gameSession.marketDashboardPlayerValue = 320000000;
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 24,
      currentPrice: closePrice,
      priceChangePercent: 7.6,
      budget: 92,
      holdingRatio: 42,
      personalParticipation: 62,
      surveillance: 32,
      volatility: 52,
      marketPressure: 36,
      madness: 38,
      pendingSocialCostDelta: 0,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 46, priceChangePercent: 2.4, fictionalVolume: 360 },
      { elapsedSec: 104, priceChangePercent: 5.8, fictionalVolume: 620 },
      { elapsedSec: 156, priceChangePercent: 7.6, fictionalVolume: 720 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareContractDaySettlementActionFitState(
  page: Page,
): Promise<void> {
  await prepareContractDaySettlementProgressState(page);
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");

    gameSession.contractActionEfficiencyBonus = 0.8;
    gameSession.contractActionMistakePenalty = 1.6;
    gameSession.lastContractActionFitResult = {
      state: gameSession.intradayState,
      actionId: "overheat_cooldown",
      fit: "risky",
      message: "의뢰 도구 위험: 매도봇 - 관심 순위와 충돌",
      sideEffectPenaltyDelta: 1.6,
      efficiencyBonusDelta: 0
    };
  })()`);
}

export async function prepareContractIntradayTrackerState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { createContractObservation } = await import("/src/domain/contract/index.ts");
    const { getAssetById } = await import("/src/domain/assets/assetCatalog.ts");

    const mandate = gameSession.startContractRun("contract_upward_touch_food");
    const asset = getAssetById(mandate.assetId);
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.startIntraday();
    const currentPrice = 11780;

    gameSession.runState = {
      ...runState,
      selectedSectorId: asset.sectorId,
      selectedAssetId: asset.id,
      phase: "intraday",
      currentDay: 1,
      cumulativeProfit: 9,
      budget: 91,
      holdingRatio: 38,
      surveillance: 34,
      socialCost: 5,
      dayResults: []
    };
    gameSession.selectedSectorId = asset.sectorId;
    gameSession.selectedAssetId = asset.id;
    gameSession.surveillanceHistory = [];
    gameSession.contractObservations = [
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: mandate.referencePrice,
        marketDashboardRank: null,
        marketDashboardValue: 0,
        madness: 0,
        surveillance: 12,
        kind: "contract_start"
      }),
      createContractObservation({
        day: 1,
        elapsedSec: 130,
        price: 11680,
        marketDashboardRank: 6,
        marketDashboardValue: 180000000,
        madness: 42,
        surveillance: 34,
        kind: "intraday_tick"
      })
    ];
    gameSession.contractEvaluationResult = null;
    gameSession.contractSettlementResult = null;
    gameSession.contractBudgetSpent = 6.8;
    gameSession.contractActionMistakePenalty = 0;
    gameSession.contractActionEfficiencyBonus = 0;
    gameSession.lastContractActionFitResult = null;
    gameSession.marketDashboardPlayerRank = 6;
    gameSession.marketDashboardPlayerValue = 180000000;
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 50,
      currentPrice,
      priceChangePercent: 17.8,
      budget: 91,
      holdingRatio: 38,
      personalParticipation: 58,
      surveillance: 34,
      volatility: 48,
      marketPressure: 44,
      madness: 42,
      pendingSocialCostDelta: 0,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 42, priceChangePercent: 4.8, fictionalVolume: 380 },
      { elapsedSec: 92, priceChangePercent: 11.4, fictionalVolume: 620 },
      { elapsedSec: 130, priceChangePercent: 17.8, fictionalVolume: 840 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareContractIntradayDeadlineState(
  page: Page,
): Promise<void> {
  await prepareContractIntradayTrackerState(page);
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const { createContractObservation } = await import("/src/domain/contract/index.ts");

    const mandate = gameSession.contractMandate;
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = 11960;

    if (!mandate) {
      throw new Error("Contract deadline state requires an active mandate.");
    }

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: mandate.durationDays,
      cumulativeProfit: 16,
      budget: 82,
      holdingRatio: 42,
      surveillance: 46,
      socialCost: 7,
      dayResults: ["안정 운용", "완전 성공"]
    };
    gameSession.contractObservations = [
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: mandate.referencePrice,
        marketDashboardRank: null,
        marketDashboardValue: 0,
        madness: 0,
        surveillance: 12,
        kind: "contract_start"
      }),
      createContractObservation({
        day: 1,
        elapsedSec: null,
        price: 11240,
        marketDashboardRank: 8,
        marketDashboardValue: 116000000,
        madness: 22,
        surveillance: 24,
        kind: "day_close"
      }),
      createContractObservation({
        day: 2,
        elapsedSec: null,
        price: 11720,
        marketDashboardRank: 7,
        marketDashboardValue: 154000000,
        madness: 34,
        surveillance: 36,
        kind: "day_close"
      }),
      createContractObservation({
        day: 3,
        elapsedSec: 162,
        price: currentPrice,
        marketDashboardRank: 6,
        marketDashboardValue: 196000000,
        madness: 48,
        surveillance: 46,
        kind: "intraday_tick"
      })
    ];
    gameSession.contractEvaluationResult = null;
    gameSession.contractSettlementResult = null;
    gameSession.contractBudgetSpent = 8.6;
    gameSession.contractActionMistakePenalty = 0.4;
    gameSession.contractActionEfficiencyBonus = 0;
    gameSession.lastContractActionFitResult = null;
    gameSession.marketDashboardPlayerRank = 6;
    gameSession.marketDashboardPlayerValue = 196000000;
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 18,
      currentPrice,
      priceChangePercent: 19.6,
      budget: 82,
      holdingRatio: 42,
      personalParticipation: 66,
      surveillance: 46,
      volatility: 58,
      marketPressure: 52,
      madness: 48,
      pendingSocialCostDelta: 0,
      retailSwarmState: "overheat",
      activeDocumentEventId: null,
      documentEventChoices: [],
      documentEventHistory: [
        { eventId: "market_overheat_warning", choiceType: "stable", elapsedSec: 38 },
        { eventId: "community_surge_alert", choiceType: "avoid", elapsedSec: 86 }
      ],
      lastDocumentEventElapsedSec: 86,
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 54, priceChangePercent: 8.8, fictionalVolume: 480 },
      { elapsedSec: 112, priceChangePercent: 15.2, fictionalVolume: 720 },
      { elapsedSec: 162, priceChangePercent: 19.6, fictionalVolume: 940 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareRegularPreOpenChoiceState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(intradayState.openingPrice * 1.042);
    const carriedAverageEntryPrice = intradayState.averageEntryPrice ?? Math.round(intradayState.openingPrice * 1.03);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 1,
      cumulativeProfit: 6,
      budget: 104,
      holdingRatio: 32,
      averageEntryPrice: carriedAverageEntryPrice,
      lastClosePrice: null,
      surveillance: 24,
      socialCost: 4,
      dayResults: []
    };
    gameSession.surveillanceHistory = [];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 8,
      currentPrice,
      priceChangePercent: 4.2,
      budget: 104,
      holdingRatio: 32,
      averageEntryPrice: carriedAverageEntryPrice,
      personalParticipation: 46,
      surveillance: 24,
      volatility: 36,
      pendingSocialCostDelta: 1,
      marketPressure: 14,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 160 },
      { elapsedSec: 48, priceChangePercent: 1.6, fictionalVolume: 260 },
      { elapsedSec: 112, priceChangePercent: 3.4, fictionalVolume: 390 },
      { elapsedSec: 172, priceChangePercent: 4.2, fictionalVolume: 430 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}

export async function prepareNextDayAssetSelectionState(
  page: Page,
): Promise<void> {
  await page.evaluate(`(async () => {
    const { gameSession } = await import("/src/game/GameSession.ts");
    const runState = gameSession.ensureRun();
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const currentPrice = Math.round(intradayState.openingPrice * 1.064);

    gameSession.runState = {
      ...runState,
      phase: "intraday",
      currentDay: 2,
      cumulativeProfit: 16,
      budget: 118,
      holdingRatio: 0,
      averageEntryPrice: null,
      lastClosePrice: null,
      surveillance: 28,
      socialCost: 7,
      dayResults: ["안정 운용"]
    };
    gameSession.surveillanceHistory = [22];
    gameSession.daySettlementResult = null;
    gameSession.finalSettlementResult = null;
    gameSession.intradayState = {
      ...intradayState,
      timeRemainingSec: 12,
      currentPrice,
      priceChangePercent: 6.4,
      budget: 118,
      holdingRatio: 0,
      heldUnits: 0,
      averageEntryPrice: null,
      personalParticipation: 35,
      surveillance: 28,
      volatility: 38,
      pendingSocialCostDelta: 0,
      marketPressure: 12,
      retailSwarmState: "interest",
      activeDocumentEventId: null,
      documentEventChoices: [],
      activeOrderBookWallEffects: [],
      orderBookWallEvents: [],
      isPaused: false
    };
    gameSession.priceHistory = [
      { elapsedSec: 0, priceChangePercent: 0, fictionalVolume: 180 },
      { elapsedSec: 54, priceChangePercent: 2.2, fictionalVolume: 360 },
      { elapsedSec: 118, priceChangePercent: 5.8, fictionalVolume: 520 },
      { elapsedSec: 168, priceChangePercent: 6.4, fictionalVolume: 440 }
    ];
    gameSession.autoCardRewardIndex = 3;
    gameSession.autoCardRewardChoices = [];
  })()`);
}
