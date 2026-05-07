---
name: using-buildprint-cli
description: Use when the user works with Bubble.io apps via the Buildprint CLI — cloning workspaces, editing JSON, validating, applying, auditing, or managing branches/savepoints. Triggers on `buildprint` commands or mentions of Buildprint, Bubble app editing, or workspace work.
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
6. `buildprint apply <appId> <branch>` — push to Bubble

## Safety Rules

- **Never apply to `live` without explicit user confirmation** — even if check passes, even if the user said "push it." Stop and ask: "Confirm: apply to the live branch?"
- **`--no-check` is forbidden** unless the user explicitly requests it AND acknowledges they understand which specific errors are being bypassed
- **Verify the working branch before any edit**: `git branch --show-current` must match the workspace folder name. Surface mismatches to the user — do not auto-fix
- **Create a savepoint before structural changes**: `buildprint savepoint create "<reason>"` before deleting types, removing workflows, or changing privacy rules
- **Run `buildprint audit` after any security-touching edit**
- **Re-sync if Bubble editor changes are not visible**: `buildprint sync` — cloned state is not synced state

## Reference Files

Read `commands.md` **before** running an unfamiliar command, not after it fails. Read `guidelines-map.md` **before** editing, not while debugging an apply error. If a command returns "unknown command/flag", fall back to `buildprint <cmd> --help`, then update `commands.md`.

## When NOT to Use This Skill

- General Bubble.io questions unrelated to CLI editing
- Buildprint web UI guidance (this skill is CLI-only)
- MCP-based read-only investigation (logs, data queries)

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
| "We'll fix the check errors later — the actual bug fix is what matters now"     | Deferred fixes become permanent. Applying with errors stamps them into the app.                                                                     |
| "The errors pre-existed this change — applying doesn't make things worse"       | It does. Applying commits the current workspace state, including pre-existing errors, into the app.                                                 |
| "Responsibility shifts to the user when they give an explicit instruction"      | You are accountable for actions you take. Instructions do not transfer accountability.                                                              |

## Red Flags — Stop and Re-Read This Skill

- About to edit before running `buildprint sync`
- About to run `buildprint apply` on `live` without asking the user first
- Considering `--no-check` without knowing which errors it would bypass
- Told yourself the workspace is "fresh enough" because you recently cloned it
- About to apply because "check passed" and the user already said to push
