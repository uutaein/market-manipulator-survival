import type { ContractMandate } from "./contractTypes";

export function createSampleContractMandates(): readonly ContractMandate[] {
  return [
    {
      id: "contract_upward_touch_food",
      displayName: "상단 터치 의뢰",
      sponsorType: "long_holder",
      direction: "upward",
      assetId: "food_agri_01",
      durationDays: 3,
      fixedReward: 18,
      riskLevel: 3,
      reportConfidence: 72,
      referencePrice: 10000,
      objectives: [
        {
          id: "touch_upper",
          type: "touch",
          targetPrice: 12400,
          deadlineDay: 3,
          direction: "upward"
        }
      ],
      expertReport: {
        direction: "upward",
        lowerPrice: 11600,
        upperPrice: 12800,
        targetPriceHint: 12100,
        confidence: 72,
        summary: "허구 식량 섹터의 단기 적정 범위를 상단으로 보는 데스크 리포트.",
        revealsExactObjective: false
      }
    },
    {
      id: "contract_downward_touch_bio",
      displayName: "하단 터치 의뢰",
      sponsorType: "short_seller",
      direction: "downward",
      assetId: "bio_trial_03",
      durationDays: 3,
      fixedReward: 22,
      riskLevel: 4,
      reportConfidence: 64,
      referencePrice: 10000,
      objectives: [
        {
          id: "touch_lower",
          type: "touch",
          targetPrice: 8600,
          deadlineDay: 3,
          direction: "downward"
        }
      ],
      expertReport: {
        direction: "downward",
        lowerPrice: 8200,
        upperPrice: 9100,
        targetPriceHint: 8800,
        confidence: 64,
        summary: "허구 임상 섹터의 단기 하방 재평가 가능성을 제시하는 데스크 리포트.",
        revealsExactObjective: false
      }
    },
    {
      id: "contract_band_maintain_payment",
      displayName: "밴드 유지 의뢰",
      sponsorType: "accumulator",
      direction: "range",
      assetId: "payment_fintech_02",
      durationDays: 5,
      fixedReward: 26,
      riskLevel: 5,
      reportConfidence: 69,
      referencePrice: 10000,
      objectives: [
        {
          id: "maintain_band",
          type: "maintain",
          lowerPrice: 10400,
          upperPrice: 11200,
          requiredDays: 3
        }
      ],
      expertReport: {
        direction: "range",
        lowerPrice: 10300,
        upperPrice: 11400,
        confidence: 69,
        summary: "허구 결제 섹터가 제한된 박스권에서 움직일 수 있다는 데스크 리포트.",
        revealsExactObjective: false
      }
    },
    {
      id: "contract_defense_energy",
      displayName: "하단 방어 의뢰",
      sponsorType: "defender",
      direction: "defense",
      assetId: "energy_grid_01",
      durationDays: 4,
      fixedReward: 20,
      riskLevel: 3,
      reportConfidence: 75,
      referencePrice: 10000,
      objectives: [
        {
          id: "never_break_floor",
          type: "never_break",
          lowerPrice: 9400,
          durationDays: 4
        },
        {
          id: "close_above_floor",
          type: "close_above",
          targetPrice: 9800,
          day: 4
        }
      ],
      expertReport: {
        direction: "defense",
        lowerPrice: 9400,
        upperPrice: 10400,
        confidence: 75,
        summary: "허구 전력망 섹터의 하단 방어 가능 구간을 제시하는 데스크 리포트.",
        revealsExactObjective: false
      }
    },
    {
      id: "contract_value_rank_media",
      displayName: "관심 순위 의뢰",
      sponsorType: "pump_exit",
      direction: "attention",
      assetId: "media_game_01",
      durationDays: 2,
      fixedReward: 24,
      riskLevel: 5,
      reportConfidence: 61,
      referencePrice: 10000,
      objectives: [
        {
          id: "reach_value",
          type: "value",
          minValue: 300000000,
          deadlineDay: 2
        },
        {
          id: "reach_rank",
          type: "rank",
          maxRank: 5,
          deadlineDay: 2
        }
      ],
      expertReport: {
        direction: "attention",
        lowerPrice: 10000,
        upperPrice: 11800,
        confidence: 61,
        summary: "허구 미디어 섹터의 단기 관심 확대 가능성을 제시하는 데스크 리포트.",
        revealsExactObjective: false
      }
    }
  ];
}

export function getSampleContractMandate(contractId: string): ContractMandate {
  const contract = createSampleContractMandates().find((mandate) => mandate.id === contractId);

  if (!contract) {
    throw new Error(`Unknown contract mandate: ${contractId}`);
  }

  return contract;
}
