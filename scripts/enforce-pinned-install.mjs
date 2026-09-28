/**
 * In CI, pnpm defaults to --frozen-lockfile, so installs match pnpm-lock.yaml.
 * This guard only fails if someone explicitly disables it (--no-frozen-lockfile).
 */

function isCi() {
  return (
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.GITHUB_ACTIONS === "true" ||
    process.env.GITLAB_CI === "true" ||
    process.env.TF_BUILD === "True" ||
    !!process.env.VERCEL
  );
}

if (!isCi()) {
  process.exit(0);
}

const frozenDisabled =
  process.env.npm_config_frozen_lockfile === "false" ||
  process.env.npm_config_frozen_lockfile === "0";

if (!frozenDisabled) {
  process.exit(0);
}

console.error(
  [
    "ERROR: In CI, --frozen-lockfile must not be disabled.",
    "       Frozen installs use exact versions from pnpm-lock.yaml and will not",
    "       resolve newer releases within semver ranges.",
  ].join("\n"),
);
process.exit(1);