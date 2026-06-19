/**
 * buildprint-cli plugin for OpenCode
 *
 * Registers the bundled skill directory so OpenCode discovers it via the
 * native `skill` tool when this package is installed as a git-spec plugin.
 * Mirrors the superpowers plugin pattern (config hook + config.skills.paths).
 * The skills themselves are plain markdown; this shim only makes them
 * discoverable — no build step, no runtime dependencies.
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BuildprintPlugin = async () => {
  // Entry lives at <repo>/.opencode/plugins/ ; ../../ reaches the repo root.
  const skillsDir = path.resolve(
    __dirname,
    "../../plugins/buildprint-cli/skills",
  );

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },
  };
};
