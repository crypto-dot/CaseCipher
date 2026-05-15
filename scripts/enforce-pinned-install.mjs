/**
 * In CI, require a frozen lockfile install so dependency trees match pnpm-lock.yaml.
 * Plain `pnpm install` can still resolve newer versions when package.json uses ^ or ~.
 */

function isCi() {
  return (
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.GITHUB_ACTIONS === "true" ||
    process.env.GITLAB_CI === "true" ||
    process.env.TF_BUILD === "True"
  );
}

if (!isCi()) {
  process.exit(0);
}

const frozen =
  process.env.npm_config_frozen_lockfile === "true" ||
  process.env.npm_config_frozen_lockfile === "1" ||
  process.argv.includes("--frozen-lockfile");

if (frozen) {
  process.exit(0);
}

console.error(
  [
    "ERROR: In CI you must run `pnpm install --frozen-lockfile`, not plain `pnpm install`.",
    "       Frozen installs use exact versions from pnpm-lock.yaml and will not",
    "       resolve newer releases within semver ranges.",
  ].join("\n"),
);
process.exit(1);
