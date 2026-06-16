export function getBudgetPreservationPercent(
  currentBudget: number,
  startingBudget: number,
): number {
  if (startingBudget <= 0) {
    return 0;
  }

  return Math.round((currentBudget / startingBudget) * 1000) / 10;
}

export function getBudgetPreservationLabel(
  preservationPercent: number,
): string {
  if (preservationPercent >= 90) {
    return "예산 보전 안정";
  }

  if (preservationPercent >= 70) {
    return "예산 보전 주의";
  }

  if (preservationPercent >= 50) {
    return "예산 보전 압박";
  }

  return "50% 기준 미달";
}
