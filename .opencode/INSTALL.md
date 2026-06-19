# Installing buildprint-cli for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- [Buildprint CLI](https://docs.buildprint.ai/cli/installation-and-authentication-iwixh) installed and authenticated (`buildprint link <token>`)

## Installation

Add `buildprint-cli` to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["buildprint-cli@git+https://github.com/rafachavantes/using-buildprint-cli"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager (via Bun) and registers its skill directory so the `using-buildprint-cli` skill is discoverable through the native `skill` tool.

Verify by asking: "Help me work on my Bubble.io app via Buildprint" — the agent should activate the skill and run `buildprint guidelines get general` first.

## How it works

OpenCode does **not** auto-discover skills from installed packages. This plugin is a tiny shim (`.opencode/plugins/buildprint-cli.js`) whose `config` hook pushes the bundled skill path (`plugins/buildprint-cli/skills`) into `config.skills.paths`. The skills themselves stay plain markdown — no build step, no runtime dependencies.

If you also use Claude Code or Codex CLI, install the plugin separately for each harness (see the root `README.md`).

## Migrating from a manual install

If you previously copied or symlinked the skill into a global skills directory, remove it before (or after) installing the plugin to avoid a duplicate-skill conflict:

```bash
# Remove a manual copy or symlink
rm -rf ~/.config/opencode/skills/using-buildprint-cli
rm -rf ~/.agents/skills/using-buildprint-cli
```

Then follow the installation steps above. The plugin-registered path becomes the single source of truth.

## Usage

Use OpenCode's native `skill` tool:

```
use skill tool to load using-buildprint-cli
```

Then follow the canonical workflow: `sync → explore → fetch guidelines → edit → check → apply`.

## Updating

OpenCode installs `buildprint-cli` through a git-backed package spec. A restart may not pick up the newest commit if Bun pins the resolved git dependency in its cache. If updates don't appear, clear OpenCode's package cache or reinstall the plugin.

To pin a specific version, append a tag or commit ref:

```json
{
  "plugin": ["buildprint-cli@git+https://github.com/rafachavantes/using-buildprint-cli#v0.3.0"]
}
```

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i buildprint`
2. Verify the `plugin` line in your `opencode.json`
3. Make sure you're running a recent version of OpenCode

### Skill not found

1. Use the `skill` tool to list discovered skills
2. Confirm the plugin loaded (see above)
3. If you migrated from a manual install, ensure the old copy is removed (duplicate names conflict)

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs. If OpenCode can't install the plugin, install it with system npm and point OpenCode at the local package:

```powershell
npm install buildprint-cli@git+https://github.com/rafachavantes/using-buildprint-cli --prefix "$HOME\.config\opencode"
```

Then reference the installed path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/buildprint-cli"]
}
```
