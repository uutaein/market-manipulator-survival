const common = {
  import: ["feature/support/**/*.ts", "feature/steps/**/*.ts"],
  paths: ["feature/**/*.feature"],
  tags: "not @playwright",
  format: ["progress"],
  publish: false,
  exit: true
};

export const execution = {
  ...common,
  paths: ["feature/intraday/local_synthetic_execution.feature"],
  format: ["summary"],
  failFast: true
};

export default common;
