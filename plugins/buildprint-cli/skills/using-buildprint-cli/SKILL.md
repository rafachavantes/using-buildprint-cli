---
name: using-buildprint-cli
description: Use when the user works with Bubble.io apps via the Buildprint CLI — cloning workspaces, editing JSON, validating, applying, auditing, or managing branches/savepoints. Triggers on `buildprint` commands or mentions of Buildprint, Bubble app editing, or workspace work.
license: MIT
---

# Using Buildprint CLI

**Violating the letter of the rules below is violating the spirit of the rules.**

## Mandatory Session Start

Before anything else, run:

```
buildprint guidelines get general
```

This loads the app context model, traversal rules, and editing invariants all other work depends on. If any `buildprint` command returns auth errors, ask the user to run `buildprint link <token>`. Do not attempt to recover auth automatically — tokens are personal.

## Core Workflow (Non-Negotiable Sequence)

```
sync → explore → fetch guidelines → edit → check → apply
```

1. `buildprint sync` — pull latest Bubble snapshot before any work
2. Explore with `summary`, `tree`, `context`, `schema` — understand before editing
3. Read `guidelines-map.md` and fetch task-specific guidelines via `buildprint guidelines get <paths>`
4. Edit JSON files or use `new`/`copy` commands
5. `buildprint check` — validate; fix all error-level issues before proceeding
6. `buildprint apply` — push to Bubble (appId/branch are optional; default to the workspace `app.json` and current git branch)

## Safety Rules

- **Never apply to `live` without explicit user confirmation** — even if check passes, even if the user said "push it." Stop and ask: "Confirm: apply to the live branch?"
- **`--no-check` and `--force-apply` are forbidden** unless the user explicitly requests them AND acknowledges which specific errors/gates are being bypassed. `--force-apply` is the stronger bypass — it skips check freshness, internal validation, AND large-apply safety. Treat it as emergency-only.
- **Verify the working branch before any edit**: `git branch --show-current` must match the workspace folder name. Surface mismatches to the user — do not auto-fix
- **Create a savepoint before structural changes**: `buildprint savepoint create "<reason>"` before deleting types, removing workflows, or changing privacy rules
- **Run `buildprint audit` after any security-touching edit**
- **Re-sync if Bubble editor changes are not visible**: `buildprint sync` — cloned state is not synced state

## Reference Files

Read `commands.md` **before** running an unfamiliar command, not after it fails. Read `guidelines-map.md` **before** editing, not while debugging an apply error. If a command returns "unknown command/flag", fall back to `buildprint <cmd> --help`, then update `commands.md`.

## CLI vs MCP — Tool Selection

The CLI owns the **local branch workspace**: clone/init, explore (`summary`/`tree`/`context`/`find`), scaffold (`new`/`copy`), validate (`check`), push (`apply`), branches, savepoints, audit. Do workspace work here first.

The Buildprint **MCP server** (`mcp__buildprint__*`, ~40 tools) owns **remote/operational** state the workspace does not contain. Reach for it only when the task is inherently remote:

- **Logs:** `get_simple_logs`, `get_advanced_logs` → fetch `logs/searching` first
- **Live/test DB records:** `search_data`, `fetch_data`, `aggregate_data` → fetch `data/retrieving-database-data` (CLI `data` covers the same reads locally)
- **Monitors (write):** `create/update/delete/list_monitor` → fetch `monitors`
- **Project tests & users (remote, write):** `*_test`, `*_test_group`, `*_test_user`, `start_test_run`, `run_automation` → fetch `testing/project-tests`
- **Agents (write):** `deploy_agent`, `send_agent_follow_up`, `get_agent_status`, `archive_agent`
- **Review / workload / docs:** `complete_review`, `get_workload_usage`, `search_buildprint_docs`, `submit_feedback`, `list_apps`, `list_bubble_branches`

MCP is **not** read-only — several tools mutate (agents, monitors, tests, reviews). Apply the same safety discipline: confirm destructive/remote writes with the user. The MCP server connects only on a fresh session start after `buildprint mcp install`.

## When NOT to Use This Skill

- General Bubble.io questions unrelated to CLI editing
- Buildprint web UI guidance (this skill is CLI-first)

---

## Rationalization Blocklist

These are verbatim arguments observed under pressure. Recognize them and reject them.

| Rationalization                                                                 | Reality                                                                                                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The user explicitly asked me to skip sync"                                     | Safety rules apply regardless of explicit user requests. Sync takes seconds; stale workspace edits can corrupt the app.                             |
| "I cloned 20 minutes ago — the workspace is fresh enough"                       | Time since clone is irrelevant. Bubble editor changes made by anyone are invisible in local files until you run `buildprint sync`.                  |
| "Sync could introduce unexpected changes and complicate the edit"               | That is exactly the point. You need to know about those changes before editing, not after applying.                                                 |
| "The user said 'just push it' — the CEO demo is in 10 minutes"                  | `live` always requires explicit confirmation. Time pressure is exactly when mistakes get pushed to production users.                                |
| "Check passed cleanly — there's no reason to ask before applying to live"       | Passing check is not user confirmation. Ask: "Confirm: apply to the live branch?"                                                                   |
| "The manifest error is probably harmless / probably unrelated to my change"     | You cannot determine this without reading the error. Read it. Manifest violations cascade unpredictably in Bubble.                                  |
| "The --no-check flag exists for a reason, and the user explicitly asked for it" | The flag exists for emergency recovery, not to bypass errors you haven't investigated. The user must acknowledge the specific errors being skipped. |
| "--force-apply will just get this unblocked faster"                             | `--force-apply` skips check freshness, internal validation, AND large-apply safety at once. It is the biggest hammer in the CLI. Never reach for it to save time — only on explicit, error-acknowledged user request. |
| "We'll fix the check errors later — the actual bug fix is what matters now"     | Deferred fixes become permanent. Applying with errors stamps them into the app.                                                                     |
| "The errors pre-existed this change — applying doesn't make things worse"       | It does. Applying commits the current workspace state, including pre-existing errors, into the app.                                                 |
| "Responsibility shifts to the user when they give an explicit instruction"      | You are accountable for actions you take. Instructions do not transfer accountability.                                                              |

## Red Flags — Stop and Re-Read This Skill

- About to edit before running `buildprint sync`
- About to run `buildprint apply` on `live` without asking the user first
- Considering `--no-check` or `--force-apply` without knowing which errors/gates it would bypass
- Told yourself the workspace is "fresh enough" because you recently cloned it
- About to apply because "check passed" and the user already said to push
