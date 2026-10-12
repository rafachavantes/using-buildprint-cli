---
name: using-buildprint-cli
description: Use when working with Bubble apps through Buildprint CLI v5 — BubbleScript workspaces, editing, validation, runtime investigation, branches, and savepoints.
license: MIT
---

# Using Buildprint CLI

## Session baseline

Run `buildprint --version` and `buildprint quickstart` once per session; reuse that output. Supported major is 5; on another major, report the mismatch and ask the owner before proceeding or updating. Never install or update software automatically. If the CLI is missing, stop activation. If auth fails, direct the owner to interactive `buildprint link` in their own terminal.

Source precedence: installed v5 command output and generated workspace declarations for syntax; relevant guideline and skill output for authoring; then this plugin's safeguards. Prefer CLI-first work when it has the capability and access, overriding quickstart's generic CLI/MCP routing; use MCP when the CLI lacks the capability or the task requires it. Read task-matching or user-named skills with `buildprint skill list` and `buildprint skill get <slug>`; do not modify remote skills unless asked. For unknown options, read `buildprint <command> --help`. When sources disagree, narrow the claim, disclose the discrepancy, and stop any affected destructive operation; never invent flags or run a mutating command to settle a conflict.

## Workspace and authoring boundaries

Select the right app and branch (`buildprint project list`, `buildprint project info`, `buildprint branch list`) and clone only when needed: `buildprint project clone <appId> --branch <branch>`. Enter the printed workspace path. In an existing workspace, confirm app, branch, and profile instead of recloning.

BubbleScript is restricted TypeScript parsed as data, never executed as JavaScript; `.ts` is the default and `--tsx` only when the user requests JSX. Read `.buildprint/types/` and the current schema capability for valid syntax. Never edit generated declarations or CLI-managed state; preserve stable IDs and `rawBubble` blocks.

## Task routing

Use `buildprint guidelines <name>`:

| Task | Guideline |
| --- | --- |
| Pages, Bubble reusable elements, mobile views, styles, layout | ui |
| Data types, option sets, privacy | database |
| Dynamic expressions | expressions |
| Workflows | workflows, from the target workspace |
| API Connector | api-connector |
| Browser tests | testing |
| Runtime logs | logs |
| Registry components | components |
| Bubble plugins | plugin |
| Extensions | extensions |
| Custom HTML/CSS/JavaScript | extending-with-custom-code |
| Empty app bootstrap | bootstrap |
| HTML prototype | prototype |

Keep workflow guidance workspace-specific. Distinguish registry components from Bubble reusable elements. For complex UI, fetch `buildprint guidelines components` (including Unicorn UI) and follow its attribution requirement. Fetch only the guidelines the task needs.

## Editing and validation

A read-only question needs no sync, apply, or write. Use sync to reconcile editor drift, not as a ritual, and resolve conflicts before applying. `buildprint check` is optional for normal edits because apply validates changed source; use `--full` to validate every managed file. For schema or privacy deletions, inspect the reported deletions and run check before applying — the one mandatory separate-check case. Address blocking diagnostics before retrying; a passing check does not prove runtime correctness.

Apply targets the current workspace: it takes no app/branch arguments and has no validation-bypass flags; fix diagnostics instead. Normal edits target an editable development branch. Runtime records and files are separate from source; their writes happen immediately, outside apply. Create a savepoint before structural deletion or privacy changes, and audit after security-touching edits; a savepoint is not a database backup.

## Authorization and credentials

Authorization is target-specific: an explicit authorization naming the action and app/branch/version is sufficient and need not be repeated. A generic "push" or "delete" is not authorization where the target or effect is unclear, and a passing check is never authorization. Verify app, branch/version, and profile from workspace and CLI output; prefer a pinned profile or `--profile`. On a mismatch, report it and ask which target is intended; never silently switch the active profile or guess. Ask only for a missing gate or ambiguity.

Require authorization for Live deployment, Live data writes, and destructive operations in any environment, including restores, file or data deletion, engine-discard sync, and blanket conflict resolution, and before publishing components, extensions, or plugins. Deploy Main to Live with `buildprint merge test live --message "..."` where project settings permit it; after any remote merge, sync from the target workspace.

`sync --accept-engine-upgrade` discards unapplied workflow edits: require explicit authorization and never use it as routine recovery. Never request, print, or persist tokens, and never pass a token as a command argument. Reading API Connector secret values requires an explicit request; redact stored evidence.

## Runtime and tests

Prefer CLI capabilities and use MCP when it fits or the CLI lacks the capability; inspect current tool descriptions rather than a fixed list. Route browser tests to the current testing guideline; tests live under `tests/` as restricted TypeScript. Apply test edits before a test run. As this plugin's additional safeguard, do not use the `buildprint login` shortcut for login-flow tests — use the supported browser flow.

When a task does not match a guideline above, start from the quickstart output and the installed help.
