# Buildprint CLI Skill — Design Spec

**Date:** 2026-05-07  
**Status:** Approved  
**Author:** Rafael (contato@moara.digital)

---

## Problem

When using Buildprint on the web, the platform automatically injects a rich context layer before every agent call: Bubble's entity model, valid action types, element relationships, privacy rule semantics, filesystem conventions, and workflow guardrails. The CLI provides none of this — Claude sees only raw JSON files. This skill is the context injection mechanism that replicates the web platform experience for CLI-based work.

---

## Goal

A Claude Code skill that gives Claude everything it needs to drive the Buildprint CLI correctly: the right workflow, the right context fetched at the right time, a complete command reference, and non-negotiable safety guardrails.

---

## Scope

- **In:** CLI workflow (clone → sync → explore → edit → check → apply), guideline navigation, command reference, safety patterns
- **Out:** MCP-based log/data investigation, Buildprint web UI, Bubble.io standalone usage (no Buildprint)

---

## Architecture

### Option chosen: Thin orchestrator + delegated context (Option A)

The `buildprint guidelines` CLI command exposes Buildprint's full Bubble knowledge system on-demand (`buildprint guidelines get <path>`). The skill teaches Claude _when_ to fetch which guideline rather than duplicating that knowledge. `commands.md` provides a cached CLI reference to avoid repeated `--help` calls.

### File structure

```
/Users/rafa/Documents/Development/builtprint-skill/   ← plugin repo root
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── using-buildprint-cli/
│       ├── SKILL.md           ← Thin orchestrator: trigger + workflow + safety
│       ├── commands.md        ← Full CLI reference (loaded on-demand)
│       └── guidelines-map.md  ← Task → guideline routing table (loaded on-demand)
├── README.md
└── LICENSE
```

---

## SKILL.md Design

**Target:** ~400 tokens. Loaded when skill activates.

### Frontmatter

```yaml
---
name: using-buildprint-cli
description: Use when the user works with Bubble.io apps via the Buildprint CLI — cloning workspaces, editing JSON, validating, applying, auditing, or managing branches/savepoints. Triggers on `buildprint` commands or mentions of Buildprint, Bubble app editing, or workspace work.
---
```

### Content sections

**1. Mandatory session start**

- Run `buildprint guidelines get general` before anything else — this is the session baseline (app context model + traversal rules)
- If any `buildprint` command returns auth/credential errors, ask the user to run `buildprint link <token>` first. Do not attempt to recover auth automatically — tokens are personal.

**2. Core workflow loop (non-negotiable sequence)**

```
sync → explore → fetch task guidelines → edit → check → apply
```

1. `buildprint sync` — pull latest Bubble snapshot before any work
2. Explore with `summary`, `tree`, `context`, `schema` — understand before editing
3. Fetch task-specific guidelines — read `guidelines-map.md` for the lookup table
4. Edit JSON files or use `new`/`copy` commands
5. `buildprint check` — validate, fix all error-level issues
6. `buildprint apply <appId> <branch>` — push to Bubble

**3. Safety rules**

- Never apply to `live` without explicit user confirmation
- `--no-check` is forbidden unless user explicitly requests it
- Verify the working branch before any edit: confirm the workspace directory name matches the git branch name (`git branch --show-current`). Apply refuses on mismatch — surface this to the user rather than auto-fixing
- Create a savepoint (`buildprint savepoint create "<reason>"`) before structural changes (deleting types, removing workflows, changing privacy rules)
- Run `buildprint audit` after any security-touching edit
- Re-sync if user reports their direct Bubble editor changes aren't visible

**4. Reference files directive**

- Read `commands.md` BEFORE running an unfamiliar command, not after it fails
- Read `guidelines-map.md` BEFORE editing, not while debugging an apply error
- If a command behaves unexpectedly or returns "unknown command/flag", fall back to `buildprint <cmd> --help`, then update `commands.md`

**5. When NOT to use this skill**

- General Bubble.io questions unrelated to CLI editing
- Buildprint web UI (this skill is CLI-specific)
- MCP-based read-only investigation (logs, data queries)

---

## commands.md Design

**Target:** Comprehensive, scannable. Organized by command family. Loaded on-demand.

### Sections

1. Auth & projects — `link`, `project list/clone/info`
2. Branches — `branch list/create`
3. Workspace lifecycle — `sync`, `check`, `apply`
4. Exploration — `summary`, `tree`, `context`, `schema`, `docs`
5. Entity creation — `new page/reusable/mobile/data_type/option_set/workflow/action/folder`
6. Copying — `copy root/workflow/element/action`
7. Safety & audit — `savepoint create/list/restore`, `audit`
8. Utilities — `utils generate-ids`, `guidelines list/get`, `workspaces`

Each command entry includes: full syntax, all flags with descriptions, key constraints or gotchas.

---

## guidelines-map.md Design

**Target:** Pure routing table. Loaded before editing sessions.

### Structure

- **Always (session start):** `buildprint guidelines get general`
- **By task type:** A table mapping task → `buildprint guidelines get <paths>` command

### Task coverage

| Task category                  | Guidelines                                                   |
| ------------------------------ | ------------------------------------------------------------ |
| Editing any file               | `editing/apps`                                               |
| UI / pages / elements / styles | `editing/apps editing/frontend editing/frontend/expressions` |
| Frontend migration             | `editing/frontend migrating/frontend`                        |
| Data types                     | `schema/data-type editing/apps`                              |
| Option sets                    | `schema/option-set`                                          |
| Workflows (general)            | `schema/workflow schema/action`                              |
| Backend / API workflows        | `workflows/backend schema/workflow`                          |
| Custom events                  | `workflows/custom-events`                                    |
| Database triggers              | `workflows/database-triggers`                                |
| Dynamic expressions            | `schema/dynamic-expression editing/frontend/expressions`     |
| API Connector                  | `schema/api-connector`                                       |
| Stripe / billing               | `cookbooks/stripe schema/api-connector`                      |
| Refactoring into reusables     | `cookbooks/refactoring-into-reusables`                       |
| Privacy rules / access control | `security/privacy-rules security/bubble`                     |
| Security review / audit        | `security/bubble security/privacy-rules`                     |
| Live data investigation        | `data/retrieving-database-data`                              |
| Log investigation              | `logs/searching`                                             |
| Workload analysis              | `workload/unit-analysis`                                     |
| Monitors                       | `monitors`                                                   |
| Browser automation             | `browser/agent-browser`                                      |
| Project tests                  | `testing/project-tests`                                      |

**Verification rule:** After fetching guidelines for a high-risk task (privacy, security, data type changes), summarize key constraints to the user before editing.

---

## Plugin Packaging

### `.claude-plugin/plugin.json`

The manifest lives inside a `.claude-plugin/` directory at the repo root, matching the Claude Code plugin convention.

```json
{
  "name": "buildprint-cli",
  "description": "Skill for working with Bubble.io apps via the Buildprint CLI: workflow enforcement, guideline navigation, and command reference",
  "version": "0.1.0",
  "author": { "name": "Rafael", "email": "contato@moara.digital" },
  "keywords": ["bubble", "buildprint", "cli", "no-code"]
}
```

### README.md covers

- What the plugin does
- Installation: `npm install -g buildprint`, `buildprint link <token>`
- Usage: how to trigger the skill
- Link to Buildprint docs

### Distribution path

- Initial: local plugin (`plugin install /path/to/builtprint-skill`)
- Future: publish to a marketplace (add `marketplace.json` in separate marketplace repo)

---

## Key Decisions & Rationale

| Decision                                     | Rationale                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Thin SKILL.md, delegate to guidelines        | `buildprint guidelines` is Buildprint's own context injection system — maintained by them, always current |
| Keep commands.md                             | Avoids repeated `--help` calls; one file load cheaper than 20 shell invocations                           |
| Fallback to `--help` if commands.md is stale | Solves maintenance risk without burdening the skill author                                                |
| Drop MCP from scope                          | User confirmed CLI-only; MCP is a separate flow with different tooling                                    |
| Savepoints before structural changes         | Mirrors web platform's version snapshot behavior                                                          |
| Verify branch before edit                    | CLI apply refuses on branch/folder mismatch — surface to user, don't auto-fix                             |
| Auth errors → ask user for token             | Tokens are personal, cannot be recovered programmatically                                                 |

---

## Out of Scope (explicitly)

- Buildprint REST API usage (separate skill if needed)
- Buildprint web UI guidance
- MCP server setup or usage
- Bubble.io concepts not covered by `buildprint guidelines`
- Automated testing of the skill (follows writing-skills TDD cycle, handled in implementation plan)
