import type { FinalGrade } from "../balancing/settlementValues";
import type { RunState } from "../run/runState";
import type { FinalSettlementResult } from "../settlement/settlement";

export const persistenceSchemaVersion = 1;

export const persistenceKeys = {
  currentRun: "mms.currentRun.v1",
  recentFinal: "mms.recentFinal.v1",
  bestRecord: "mms.bestRecord.v1"
} as const;

export const forbiddenPersistenceKeys = [
  "cloudAccount",
  "onlineRanking",
  "replayLog",
  "detailedPlayLog"
] as const;

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedEnvelope<T> {
  readonly schemaVersion: typeof persistenceSchemaVersion;
  readonly savedAt: string;
  readonly data: T;
}

export type LoadResult<T> =
  | { readonly status: "loaded"; readonly envelope: SavedEnvelope<T> }
  | { readonly status: "missing" }
  | { readonly status: "discarded"; readonly reason: "invalid_json" | "incompatible_schema" };

export interface BestRecord {
  readonly finalGrade: FinalGrade;
  readonly cumulativeProfit: number;
  readonly finalSurveillance: number;
}

export function saveCurrentRun(storage: KeyValueStorage, runState: RunState, savedAt = new Date().toISOString()): void {
  saveEnvelope(storage, persistenceKeys.currentRun, runState, savedAt);
}

export function loadCurrentRun(storage: KeyValueStorage): LoadResult<RunState> {
  return loadEnvelope<RunState>(storage, persistenceKeys.currentRun);
}

export function saveFinalSettlement(
  storage: KeyValueStorage,
  finalSettlement: FinalSettlementResult,
  savedAt = new Date().toISOString()
): { readonly bestRecordUpdated: boolean } {
  saveEnvelope(storage, persistenceKeys.recentFinal, finalSettlement, savedAt);

  const candidate: BestRecord = {
    finalGrade: finalSettlement.finalGrade,
    cumulativeProfit: finalSettlement.cumulativeProfit,
    finalSurveillance: finalSettlement.finalSurveillance
  };
  const currentBest = loadEnvelope<BestRecord>(storage, persistenceKeys.bestRecord);

  if (currentBest.status !== "loaded" || isBetterBestRecord(candidate, currentBest.envelope.data)) {
    saveEnvelope(storage, persistenceKeys.bestRecord, candidate, savedAt);
    return { bestRecordUpdated: true };
  }

  return { bestRecordUpdated: false };
}

export function canContinueSavedRun(storage: KeyValueStorage): boolean {
  return loadCurrentRun(storage).status === "loaded";
}

export function parseSavedEnvelope<T>(raw: string | null): SavedEnvelope<T> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedEnvelope<T>>;

    if (parsed.schemaVersion !== persistenceSchemaVersion || typeof parsed.savedAt !== "string") {
      return null;
    }

    return parsed as SavedEnvelope<T>;
  } catch {
    return null;
  }
}

export function createMapStorage(map: Map<string, string>): KeyValueStorage {
  return {
    getItem(key: string): string | null {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      map.set(key, value);
    },
    removeItem(key: string): void {
      map.delete(key);
    }
  };
}

function saveEnvelope<T>(storage: KeyValueStorage, key: string, data: T, savedAt: string): void {
  const envelope: SavedEnvelope<T> = {
    schemaVersion: persistenceSchemaVersion,
    savedAt,
    data
  };

  storage.setItem(key, JSON.stringify(envelope));
}

function loadEnvelope<T>(storage: KeyValueStorage, key: string): LoadResult<T> {
  const raw = storage.getItem(key);

  if (!raw) {
    return { status: "missing" };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedEnvelope<T>>;

    if (parsed.schemaVersion !== persistenceSchemaVersion) {
      storage.removeItem(key);
      return { status: "discarded", reason: "incompatible_schema" };
    }

    if (typeof parsed.savedAt !== "string" || !("data" in parsed)) {
      storage.removeItem(key);
      return { status: "discarded", reason: "invalid_json" };
    }

    return {
      status: "loaded",
      envelope: parsed as SavedEnvelope<T>
    };
  } catch {
    storage.removeItem(key);
    return { status: "discarded", reason: "invalid_json" };
  }
}

function isBetterBestRecord(candidate: BestRecord, current: BestRecord): boolean {
  const candidateGradeRank = finalGradeRank(candidate.finalGrade);
  const currentGradeRank = finalGradeRank(current.finalGrade);

  if (candidateGradeRank !== currentGradeRank) {
    return candidateGradeRank < currentGradeRank;
  }

  if (candidate.cumulativeProfit !== current.cumulativeProfit) {
    return candidate.cumulativeProfit > current.cumulativeProfit;
  }

  return candidate.finalSurveillance < current.finalSurveillance;
}

function finalGradeRank(grade: FinalGrade): number {
  return ["S", "A", "B", "C", "D", "F"].indexOf(grade);
}
