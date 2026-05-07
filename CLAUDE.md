# buildprint-cli Plugin — Claude Instructions

## Overview

This repo is a Claude Code plugin that gives Claude the workflow, safety guardrails, and command reference to drive the Buildprint CLI for Bubble.io app development. It replicates the context injection that Buildprint's web platform provides automatically — on the CLI, Claude sees only raw JSON files without it.

This is not a software project. The "codebase" is three markdown skill files and a JSON manifest. There is no build step, no linting, no type-checking.

## Session Continuity

Read `progress.md` at the start of every session. Update it before ending.

## File Structure

| File                                            | Purpose                                                              | Loaded                                 |
| ----------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| `.claude-plugin/plugin.json`                    | Plugin manifest (name, version, author)                              | On install                             |
| `skills/using-buildprint-cli/SKILL.md`          | Thin orchestrator: workflow, safety rules, rationalization blocklist | On skill activation                    |
| `skills/using-buildprint-cli/commands.md`       | Full CLI reference — all flags and gotchas                           | On-demand (before unfamiliar commands) |
| `skills/using-buildprint-cli/guidelines-map.md` | Task → guideline routing table                                       | On-demand (before editing sessions)    |
| `README.md`                                     | User-facing install guide                                            | Human only                             |
| `docs/superpowers/specs/`                       | Design spec                                                          | Reference                              |
| `docs/superpowers/plans/`                       | Implementation plan                                                  | Reference                              |

The three-file architecture is intentional: SKILL.md loads lean (~400 tokens) and delegates domain knowledge to `buildprint guidelines get` on-demand. Do not embed guideline content directly in SKILL.md.

## Development Workflow

### Changing SKILL.md — mandatory TDD cycle

Any edit to SKILL.md requires RED → GREEN → REFACTOR:

1. **RED**: Run a baseline subagent scenario without the change. Document the verbatim violation.
2. **GREEN**: Write the minimal change that fixes the violation. Verify with the same scenario.
3. **REFACTOR**: Run combined-pressure scenarios (3+ pressures simultaneously) to find new loopholes.

Never edit SKILL.md without first observing an agent fail without the change. Untested skill edits are invalid.

### Changing commands.md

Verify against `buildprint <cmd> --help` before editing. Update the date stamp at the top of the file: `Cached reference — verified against Buildprint docs YYYY-MM-DD.`

### Changing guidelines-map.md

Run `buildprint guidelines list` to check for new paths added by Buildprint. Add a row for each new task type.

## Commit Format

```
[type]: short description
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`

## Testing

Skill changes are tested via subagent forced-choice scenarios (A/B/C format with explicit PASS/FAIL). The REFACTOR phase uses combined-pressure scenarios (time + authority + economic + sunk cost simultaneously). There is no automated test suite.

## Distribution

- **Plugin repo:** `https://github.com/rafachavantes/using-buildprint-cli`
- **Install (one-time, in any Claude Code session):**
  - `/plugin marketplace add rafachavantes/using-buildprint-cli`
  - `/plugin install buildprint-cli@buildprint-cli`
  - `/reload-plugins`
- **Note:** the shell `claude plugin install <url>` command does **not** accept GitHub URLs. Marketplace registration only works through the TUI slash commands.
- **Official marketplace:** submit at `platform.claude.com/plugins/submit` (deferred)

## Do Not

- Edit SKILL.md without running a RED baseline scenario first
- Add commands to `commands.md` without verifying against `buildprint --help`
- Embed guideline content directly in SKILL.md — delegate to `buildprint guidelines get`
- Skip version bump in `plugin.json` when publishing a release
- Append to `progress.md` — replace it each session
