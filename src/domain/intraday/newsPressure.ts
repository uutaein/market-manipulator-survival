import { newsPricePressure } from "../balancing/priceTickValues";
import type { MorningNews } from "../day/morningNews";
import type { RunState } from "../run/runState";

export function getActiveNewsPricePressure(runState: RunState, morningNews: MorningNews): number {
  const basePressure = newsPricePressure[morningNews.templateId];

  if (morningNews.target.type === "market") {
    return basePressure * 0.5;
  }

  if (morningNews.target.type === "asset") {
    if (morningNews.target.assetId === runState.selectedAssetId) {
      return basePressure;
    }

    return morningNews.target.sectorId === runState.selectedSectorId ? basePressure * 0.7 : 0;
  }

  return morningNews.target.sectorId === runState.selectedSectorId ? basePressure * 0.7 : 0;
}
