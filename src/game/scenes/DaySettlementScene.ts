import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession } from "../GameSession";

export class DaySettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.DaySettlement);
  }

  create(): void {
    const settlement = gameSession.daySettlementResult ?? gameSession.calculateDaySettlement();
    const runState = gameSession.ensureRun();
    const nextScene = runState.currentDay >= 5 ? SceneKeys.FinalSettlement : SceneKeys.PreOpenCard;
    const nextLabel = runState.currentDay >= 5 ? "Final 정산" : "다음 Day";

    this.drawDocumentShell(
      "Day 정산 화면",
      [
        `DAY ${settlement.dayIndex}`,
        `RESULT: ${settlement.dayResultCategory}`,
        "",
        `ACTUAL PROFIT: ${formatSigned(settlement.actualProfit)}%`,
        `PROFIT BAND: ${settlement.profitBand}`,
        `SURVEILLANCE GRADE: ${settlement.surveillanceGrade}`,
        `HOLDING BAND: ${settlement.holdingBand.displayName}`,
        `SOCIAL COST: ${settlement.socialCostTotal} (+${settlement.socialCostDelta})`,
        "",
        `BUDGET: ${formatNumber(settlement.supportingRiskMetrics.budget)}`,
        `HOLDING: ${formatNumber(settlement.supportingRiskMetrics.holdingRatio)}%`,
        `PARTICIPATION: ${formatNumber(settlement.supportingRiskMetrics.personalParticipation)}`,
        `VOLATILITY: ${formatNumber(settlement.supportingRiskMetrics.volatility)}`,
        "",
        createHint(settlement.dayResultCategory, settlement.surveillanceGrade)
      ],
      {
        label: nextLabel,
        target: nextScene,
        onClick: () => {
          gameSession.continueAfterDaySettlement();
        }
      }
    );
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function createHint(dayResultCategory: string, surveillanceGrade: string): string {
  if (dayResultCategory === "손실 마감") {
    return "HINT: 다음 Day에는 유동성 공급 후 가격 추진 타이밍을 확인하세요.";
  }

  if (["D", "E"].includes(surveillanceGrade)) {
    return "HINT: 감시 부담이 높습니다. 과열 해소나 감시 완충 선택을 고려하세요.";
  }

  if (dayResultCategory === "조용한 실패") {
    return "HINT: 리스크는 낮았지만 추진력이 부족했습니다. 개장 전 선택을 바꿔보세요.";
  }

  return "HINT: 마감 전 보유 비중과 감시등급을 함께 확인하세요.";
}
