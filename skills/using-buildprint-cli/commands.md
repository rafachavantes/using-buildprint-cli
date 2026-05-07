# Buildprint CLI Command Reference

Cached reference — verified against Buildprint docs 2026-05-07.
If a command behaves unexpectedly or returns "unknown command/flag", run `buildprint <cmd> --help` and update this file.

---

## Auth & Projects

### `buildprint link <token>`

Authenticate CLI with a personal workspace token.

- Token generated at: Buildprint → Integrations → CLI → Generate CLI Token
- On success: prints all accessible projects
- On failure: re-generate and re-link; never share tokens

### `buildprint project list`

List all apps/projects accessible with the linked token.

### `buildprint project info`

Show current project info. Run inside a workspace directory.

### `buildprint project clone <appId> --branch <name> [--dir <path>]`

Clone a Bubble branch into a local workspace.

- `--branch <name>`: branch to clone (default: `test`)
- `--dir <path>`: directory for app root (optional; default: current dir)
- Creates: `<dir>/<appId>/<branch>/` with shredded normalized JSON

---

## Branches

### `buildprint branch list <appId> [--json]`

List all branches for an app with tree structure.

- `--json`: raw JSON output

### `buildprint branch create <name> [--from <version>] [--description <text>] [--no-workspace-sync] [--json]`

Create a new branch.

- `--from <version>`: base branch (default: `test`)
- `--description <text>`: optional description
- `--no-workspace-sync`: skip materializing local workspace after creation
- `--json`: raw API response
- Names are trimmed, lowercased, spaces → hyphens (server-side)

---

## Workspace Lifecycle

### `buildprint sync [--allow-suspicious-shrink]`

Pull latest Bubble snapshot and merge into local workspace.

- `--allow-suspicious-shrink`: allow sync when snapshot is unexpectedly smaller than local
- **Always run before starting editing work** — Bubble editor changes are invisible until you sync

### `buildprint check [--all] [--rule <id>] [--level error|warning|info] [--json] [--auto-apply]`

Validate workspace files against Buildprint check rules.

- `--all`: revalidate entire workspace (default: only changed files)
- `--rule <id>`: narrow to a single rule or glob, e.g. `--rule 'children-manifest/*'`
- `--level`: minimum severity threshold (default: `info`)
- `--json`: structured JSON output for scripting
- `--auto-apply`: apply immediately if zero issues (cannot combine with `--rule` or `--json`)
- **zsh note:** quote glob patterns to prevent shell expansion

### `buildprint apply <appId> <branch> [--no-check] [--allow-large-apply]`

Push committed local changes back to Bubble. Final step of the edit loop.

- `--no-check`: bypass error-level validation before applying (**forbidden unless user explicitly requests**)
- `--allow-large-apply`: allow applying a small local snapshot over a large workspace
- **Refuses if:** branch folder name ≠ git branch name, error-level issues exist (without `--no-check`), obvious size disparity (without `--allow-large-apply`)
- Auto-commits any unstaged changes with message `Apply from <appId>/<branch>`
- Returns JSON: `{ ok, appId, branch, seconds, kind: "applied"|"unchanged", applied, summary? }`

---

## Exploration

### `buildprint summary [--json]`

Top-level app overview: pages, mobile views, reusables, global elements, data types, option sets, styles, API connectors — with display names, Bubble IDs, and file paths.

- `--json`: machine-readable output

### `buildprint tree <target> [--include <list>] [--cursor <n>]`

Element and workflow subtree for a page, reusable, mobile view, or element.

- `<target>`: folder key, friendly name, or Bubble ID
- `--include <list>`: comma-separated extras from: `text,types,ids,paths,layout,design,properties,workflows,actions` (default: `types,ids`)
- `--cursor <n>`: pagination offset (results paginated at 250 lines)
- Tip: `--include properties,workflows` gives fastest functional understanding

### `buildprint context <node>`

Relationships for one node: contained by/contains, triggered by/triggers, references/referenced by, instantiates/instantiated by, plus 5 ancestors and 5 descendants.

- `<node>`: node ID, name, or file path
- More efficient than `tree` for single-node exploration

### `buildprint schema [query] [--category <name>] [--action-type <type>] [--element-type <type>] [--limit <n>]`

Search Bubble's static schema — operators, actions, element types, workflows.

- Examples:
  - `buildprint schema "append text"`
  - `buildprint schema --category actions`
  - `buildprint schema --action-type CreateThing`
  - `buildprint schema --element-type Input`

### `buildprint docs buildprint "<query>" [--limit <n>]`

Search Buildprint help documentation.

- `--limit <n>`: default 5, max 50

### `buildprint docs bubble`

Search Bubble.io documentation.

---

## Entity Creation

All `new` commands require a cloned workspace (run `buildprint project clone` first).

### Pages & Reusables

```
buildprint new page --name "<Name>" [--copy <id-or-name>]
buildprint new reusable --name "<Name>" --element-type Group [--copy <id>]
buildprint new mobile_reusable --name "<Name>" --element-type Group
buildprint new mobile --name "<Name>"
```

### Data Types

```
buildprint new data_type --name <TypeName> --field <name:type> [--field <name:type>...] [--exposed-api]
```

- Field format: `--field display_name:type` (repeatable)
- Common types: `text`, `number`, `boolean`, `date`, `user`, `file`, `image`
- Reference another type: use the type name directly (e.g. `--field order:Order`)
- `--exposed-api`: expose type through Bubble's Data API

### Option Sets

```
buildprint new option_set --name <SetName> --value <v> [--value <v>...] [--attribute <name:type>]
```

### Workflows

```
buildprint new workflow --path <path> --name "<name>" --type <Type> [flags]
```

Workflow types: `APIEvent`, `CustomEvent`, `ButtonClicked`, `PageLoaded`, `ConditionTrue`

Flags:

- `--path <path>`: owner root location (e.g. `api`, `pages/home/workflows`)
- `--param <name:type>`: input parameter; append `[]` for lists, `?` for nullable (repeatable)
- `--returnParam <name:type>`: return parameter (APIEvent and CustomEvent only)
- `--folder <name>`: place in subfolder
- `--actions <count>`: prefill N empty actions

Examples:

```
buildprint new workflow --path api --name "Create Order" --type APIEvent --param items:text[] --returnParam id:text
buildprint new workflow --path pages/home/workflows --name "Click Buy" --type ButtonClicked
```

### Actions

```
buildprint new action --path <wf-path> --type <ActionType> [--after <n>|--before <n>] [--name <name>]
```

- `--after <n>` and `--before <n>` are mutually exclusive (zero-indexed)
- Example: `buildprint new action --path api/create-order --type CreateThing`

### Folders

```
buildprint new folder --path <path> --name "<name>"
```

---

## Copying

### Copy Root (page, reusable, mobile)

```
buildprint copy root --kind page|mobile|reusable|mobile_reusable --source "<name>" --name "<new-name>"
```

### Copy Workflow

```
buildprint copy workflow --source <wf-path> --path <dest-path> [--folder <name>] [--name <new-name>]
```

### Copy Element Subtree

```
buildprint copy element --source <node-id-or-path> --path <dest-path>
```

### Copy Actions

```
buildprint copy action --from <src-wf-path> --path <dest-wf-path> --source <idx> [--source <idx>...] [--after <n>|--before <n>]
```

- `--source` is repeatable (zero-indexed action index)
- `--after` and `--before` are mutually exclusive

---

## Safety & Audit

### `buildprint savepoint create "<description>"`

Create a restore point in the Bubble editor. Description is required.

### `buildprint savepoint list [--json]`

List all savepoints with timestamps and descriptions.

### `buildprint savepoint restore <timestamp>`

Revert to a savepoint. **Run `buildprint sync` after restoring** to update local workspace.

### `buildprint audit [--json]`

Security scan of the synced workspace. Requires `buildprint sync` first.

Checks:

- Data types without Bubble privacy rules
- Public read/search/attachment/field access
- Unprotected backend workflows
- Public file/image uploads
- Frontend temporary password operations
- Insecure page redirects
- Exposed API secrets

Output (human-readable): file path, severity, check ID, summary, explanation, suggested fix.

- `--json`: structured output — `{ message, results: [{ check, title, message, fix, severity, path }] }`

---

## Utilities

### `buildprint utils generate-ids <n>`

Generate n fresh Bubble-compatible IDs (1–100 per call). IDs are in lexicographic order.

### `buildprint guidelines list`

List all available guideline paths and descriptions.

### `buildprint guidelines get <path> [<path>...]`

Fetch one or more guideline documents in one call.

- Example: `buildprint guidelines get general editing/apps schema/data-type`

### `buildprint workspaces`

List local workspaces.
