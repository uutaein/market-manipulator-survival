import { getAssetById, getAssetsBySector, getSectorById, sectors, type AssetId, type SectorId } from "../domain/assets/assetCatalog";
import { createDayState, createMarketBriefing, type DayState, type MarketBriefing } from "../domain/day/daySetup";
import {
  advanceIntradayTime,
  createIntradayState,
  isIntradayComplete,
  type IntradayState
} from "../domain/intraday/intradayState";
import { tickManualActionCooldowns, useManualAction, type ManualActionResult } from "../domain/intraday/manualActions";
import { runPlayerPriceTick } from "../domain/intraday/priceTick";
import { buildMarketBoard, type MarketBoardState } from "../domain/market/marketBoard";
import { approveOpening, selectPreOpenCard } from "../domain/preopen/preOpenCards";
import { createRunState, type RunState } from "../domain/run/runState";

export class GameSession {
  selectedSectorId: SectorId = sectors[0].id;
  selectedAssetId: AssetId = getAssetsBySector(this.selectedSectorId)[0].id;
  runState: RunState | null = null;
  dayState: DayState | null = null;
  marketBriefing: MarketBriefing | null = null;
  intradayState: IntradayState | null = null;
  marketBoardState: MarketBoardState | null = null;
  lastManualActionResult: ManualActionResult | null = null;

  setSelectedSector(sectorId: SectorId): void {
    this.selectedSectorId = sectorId;
    this.selectedAssetId = getAssetsBySector(sectorId)[0].id;
  }

  setSelectedAsset(assetId: AssetId): void {
    const asset = getAssetById(assetId);
    this.selectedSectorId = asset.sectorId;
    this.selectedAssetId = asset.id;
  }

  startNewRun(): RunState {
    this.runState = createRunState({
      selectedSectorId: this.selectedSectorId,
      selectedAssetId: this.selectedAssetId
    });
    this.dayState = null;
    this.marketBriefing = null;
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    return this.runState;
  }

  ensureRun(): RunState {
    return this.runState ?? this.startNewRun();
  }

  beginDay(): DayState {
    const runState = this.ensureRun();
    this.dayState = createDayState(runState);
    this.marketBriefing = createMarketBriefing(runState, this.dayState);
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    return this.dayState;
  }

  ensureDay(): DayState {
    return this.dayState ?? this.beginDay();
  }

  ensureMarketBriefing(): MarketBriefing {
    const runState = this.ensureRun();
    const dayState = this.ensureDay();
    this.marketBriefing = this.marketBriefing ?? createMarketBriefing(runState, dayState);
    return this.marketBriefing;
  }

  selectPreOpenCard(cardIdOrDisplayName: string): DayState {
    this.dayState = selectPreOpenCard(this.ensureDay(), cardIdOrDisplayName);
    return this.dayState;
  }

  approveOpening(): DayState {
    if (!this.ensureDay().preOpenCardId) {
      this.selectPreOpenCard("관망");
    }

    this.dayState = approveOpening(this.ensureDay());
    return this.dayState;
  }

  startIntraday(): IntradayState {
    const runState = this.ensureRun();
    const dayState = this.approveOpening();
    this.intradayState = createIntradayState(runState, dayState);
    this.marketBoardState = buildMarketBoard(runState, dayState);
    return this.intradayState;
  }

  runIntradaySecond(): IntradayState {
    const runState = this.ensureRun();
    const currentState = this.intradayState ?? this.startIntraday();

    if (isIntradayComplete(currentState)) {
      return currentState;
    }

    const tickedState = runPlayerPriceTick(currentState, {
      runSeed: runState.runSeed,
      dayIndex: runState.currentDay
    });
    const cooldownState = tickManualActionCooldowns(tickedState, 1);
    this.intradayState = advanceIntradayTime(cooldownState, 1);
    return this.intradayState;
  }

  useManualAction(actionIdOrDisplayName: string): ManualActionResult {
    const currentState = this.intradayState ?? this.startIntraday();
    this.lastManualActionResult = useManualAction(currentState, actionIdOrDisplayName);
    this.intradayState = this.lastManualActionResult.state;
    return this.lastManualActionResult;
  }

  getSelectedAssetLabel(): string {
    const asset = getAssetById(this.selectedAssetId);
    const sector = getSectorById(asset.sectorId);
    return `${sector.displayName} / ${asset.displayName}`;
  }
}

export const gameSession = new GameSession();

