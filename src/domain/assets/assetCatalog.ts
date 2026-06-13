export type SectorId =
  | "food_agri"
  | "energy_grid"
  | "bio_trial"
  | "automation_ai"
  | "chip_equipment"
  | "payment_fintech"
  | "media_game"
  | "meme_theme";

export type AssetId =
  | "food_agri_01"
  | "food_agri_02"
  | "food_agri_03"
  | "energy_grid_01"
  | "energy_grid_02"
  | "energy_grid_03"
  | "bio_trial_01"
  | "bio_trial_02"
  | "bio_trial_03"
  | "automation_ai_01"
  | "automation_ai_02"
  | "automation_ai_03"
  | "chip_equipment_01"
  | "chip_equipment_02"
  | "chip_equipment_03"
  | "payment_fintech_01"
  | "payment_fintech_02"
  | "payment_fintech_03"
  | "media_game_01"
  | "media_game_02"
  | "media_game_03"
  | "meme_theme_01"
  | "meme_theme_02"
  | "meme_theme_03";

export interface SectorDefinition {
  readonly id: SectorId;
  readonly displayName: string;
}

export interface AssetDefinition {
  readonly id: AssetId;
  readonly sectorId: SectorId;
  readonly displayName: string;
  readonly shortBriefing: string;
}

export const sectors = [
  { id: "food_agri", displayName: "식량·농업" },
  { id: "energy_grid", displayName: "에너지·전력망" },
  { id: "bio_trial", displayName: "바이오·임상" },
  { id: "automation_ai", displayName: "자동화·AI" },
  { id: "chip_equipment", displayName: "칩·장비" },
  { id: "payment_fintech", displayName: "결제·핀테크" },
  { id: "media_game", displayName: "미디어·게임" },
  { id: "meme_theme", displayName: "밈·테마" }
] as const satisfies readonly SectorDefinition[];

export const assets = [
  {
    id: "food_agri_01",
    sectorId: "food_agri",
    displayName: "밥심푸드",
    shortBriefing: "식량 가격과 급식 수요 뉴스에 빠르게 반응하는 식품 테마."
  },
  {
    id: "food_agri_02",
    sectorId: "food_agri",
    displayName: "온실상사",
    shortBriefing: "날씨와 공급 불안 문구에 관심이 붙는 시설농업 테마."
  },
  {
    id: "food_agri_03",
    sectorId: "food_agri",
    displayName: "작황컴퍼니",
    shortBriefing: "작황 전망에 따라 거래대금이 출렁이는 농업 테마."
  },
  {
    id: "energy_grid_01",
    sectorId: "energy_grid",
    displayName: "콘센트전력",
    shortBriefing: "전력망 투자 뉴스에 거래대금이 붙는 전력 테마."
  },
  {
    id: "energy_grid_02",
    sectorId: "energy_grid",
    displayName: "축전상회",
    shortBriefing: "저장장치 기대감이 붙으면 짧고 강하게 움직이는 테마."
  },
  {
    id: "energy_grid_03",
    sectorId: "energy_grid",
    displayName: "정전복구",
    shortBriefing: "복구 기대와 장애 경보가 번갈아 등장하는 전력망 테마."
  },
  {
    id: "bio_trial_01",
    sectorId: "bio_trial",
    displayName: "임상대기제약",
    shortBriefing: "승인 일정 문구 하나로 기대와 경고가 함께 붙는 임상주."
  },
  {
    id: "bio_trial_02",
    sectorId: "bio_trial",
    displayName: "캡슐바이오",
    shortBriefing: "작은 연구 성과에도 개인 참여도가 튀는 바이오 테마."
  },
  {
    id: "bio_trial_03",
    sectorId: "bio_trial",
    displayName: "승인문턱랩스",
    shortBriefing: "확정 정보보다 분위기에 크게 흔들리는 고변동 테마."
  },
  {
    id: "automation_ai_01",
    sectorId: "automation_ai",
    displayName: "자동서기",
    shortBriefing: "업무 자동화 기대감으로 초반 관심을 모으기 쉬운 테마."
  },
  {
    id: "automation_ai_02",
    sectorId: "automation_ai",
    displayName: "프롬프트공업",
    shortBriefing: "뉴스 문구와 키워드에 과민하게 반응하는 AI 테마."
  },
  {
    id: "automation_ai_03",
    sectorId: "automation_ai",
    displayName: "클릭봇시스템즈",
    shortBriefing: "관심은 빨리 붙지만 경고 문서도 빨리 따라오는 자동화 테마."
  },
  {
    id: "chip_equipment_01",
    sectorId: "chip_equipment",
    displayName: "웨이퍼상회",
    shortBriefing: "칩 공급과 수급 뉴스에 민감한 부품 테마."
  },
  {
    id: "chip_equipment_02",
    sectorId: "chip_equipment",
    displayName: "회로전자",
    shortBriefing: "유동성이 붙으면 가격 반응이 선명해지는 전자 테마."
  },
  {
    id: "chip_equipment_03",
    sectorId: "chip_equipment",
    displayName: "장비납품",
    shortBriefing: "수주 기대와 납기 지연 경고가 번갈아 나오는 장비 테마."
  },
  {
    id: "payment_fintech_01",
    sectorId: "payment_fintech",
    displayName: "도장페이",
    shortBriefing: "승인 건수와 가맹점 뉴스에 반응하는 결제 테마."
  },
  {
    id: "payment_fintech_02",
    sectorId: "payment_fintech",
    displayName: "원장테크",
    shortBriefing: "정산 안정성과 원장 기술 뉴스에 유동성이 붙는 핀테크."
  },
  {
    id: "payment_fintech_03",
    sectorId: "payment_fintech",
    displayName: "영수증핀테크",
    shortBriefing: "예산 효율은 좋지만 경고 문서에 민감한 결제 테마."
  },
  {
    id: "media_game_01",
    sectorId: "media_game",
    displayName: "클릭방송",
    shortBriefing: "트래픽 소식에 개인 참여도가 빠르게 붙는 미디어 테마."
  },
  {
    id: "media_game_02",
    sectorId: "media_game",
    displayName: "패치노트게임즈",
    shortBriefing: "업데이트 문구 하나로 과열과 실망이 교차하는 게임 테마."
  },
  {
    id: "media_game_03",
    sectorId: "media_game",
    displayName: "시즌패스미디어",
    shortBriefing: "넓게 주목받지만 관심 유지가 어려운 콘텐츠 테마."
  },
  {
    id: "meme_theme_01",
    sectorId: "meme_theme",
    displayName: "밈광장",
    shortBriefing: "짧은 유행 문구에 관심이 빠르게 모였다가 흩어지는 테마."
  },
  {
    id: "meme_theme_02",
    sectorId: "meme_theme",
    displayName: "밈장부",
    shortBriefing: "웃음과 패닉이 같은 속도로 번지는 고위험 밈 테마."
  },
  {
    id: "meme_theme_03",
    sectorId: "meme_theme",
    displayName: "댓글연쇄",
    shortBriefing: "댓글 분위기가 Retail Swarm으로 바로 번지는 커뮤니티 테마."
  }
] as const satisfies readonly AssetDefinition[];

export function getAssetsBySector(sectorId: SectorId): readonly AssetDefinition[] {
  return assets.filter((asset) => asset.sectorId === sectorId);
}

export function getAssetById(assetId: AssetId): AssetDefinition {
  const asset = assets.find((candidate) => candidate.id === assetId);

  if (!asset) {
    throw new Error(`Unknown asset ID: ${assetId}`);
  }

  return asset;
}

export function getSectorById(sectorId: SectorId): SectorDefinition {
  const sector = sectors.find((candidate) => candidate.id === sectorId);

  if (!sector) {
    throw new Error(`Unknown sector ID: ${sectorId}`);
  }

  return sector;
}
