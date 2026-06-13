export const SceneKeys = {
  MainMenu: "main-menu",
  RunSetup: "run-setup",
  MorningBriefing: "morning-briefing",
  PreOpenCard: "pre-open-card",
  Intraday: "intraday",
  DaySettlement: "day-settlement",
  FinalSettlement: "final-settlement"
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
