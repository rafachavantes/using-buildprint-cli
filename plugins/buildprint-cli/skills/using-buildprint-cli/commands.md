# Buildprint CLI Command Reference

Cached reference — verified against Buildprint CLI v0.1.37 (`buildprint --version`) on 2026-06-11.
If a command behaves unexpectedly or returns "unknown command/flag", run `buildprint <cmd> --help` and update this file.

The CLI is self-documenting and `buildprint quickstart` now prints a rich (~44KB) agent playbook. Treat that and `--help` as the source of truth; this file is a fast cache, not a replacement.

---

## Auth & Projects

### `buildprint link [token]`

Authenticate CLI with a personal workspace token.

- Token generated at: Buildprint → Integrations → CLI → Generate CLI Token
- On success: prints all accessible projects
- On failure: re-generate and re-link; never share tokens

### `buildprint init <appId> [branch]`

Clone the **first** branch workspace for an app, print its summary, and show the quickstart playbook.

- `branch`: Bubble branch to clone (default: `test`)
- `--dir <path>`: override app root directory (default: `<appId>`); branch workspace is always `<app-root>/<branch>/`
- Use this for the first workspace of an app. If the app already has a local workspace, use `project clone` for additional branches.

### `buildprint project list [--json]`

List all apps/projects accessible with the linked token.

### `buildprint project info <appId> [--json]`

Show details for a linked Bubble app.

### `buildprint project clone <appId> [--branch <name>] [--dir <path>]`

Clone a Bubble branch into a local workspace (shared app root per app).

- `--branch <name>`: branch to clone (default: `test`)
- `--dir <path>`: directory for app root (optional; default: current dir)
- Creates: `<app-root>/<branch>/` with shredded normalized JSON

### `buildprint workspaces`

List local workspaces.

---

## Branches

### `buildprint branch [appIdOrBranch] [branch]`

Inspect one Bubble branch (display name, version URL, branch tree).

- No args inside a branch workspace: current branch
- `buildprint branch <branch>` from any workspace for that app
- `buildprint branch <appId> <branch>` from anywhere

### `buildprint branch list <appId> [--json]`

List all branches for an app with tree structure.

### `buildprint branch create <name> [--from <version>] [--description <text>] [--no-workspace-sync] [--json]`

Create a new branch.

- `--from <version>`: base branch (default: `test`)
- `--no-workspace-sync`: skip materializing local workspace after creation
- Names are trimmed, lowercased, spaces → hyphens (server-side)

### `buildprint merge <from> <to> [--resolve <key=choice>] [--resolve-all <choice>] [--json]`

Merge one Bubble branch into another using Bubble's **native** merge flow.

- `from`: incoming branch name or ID; `to`: target branch receiving the merge
- Clean merges are finalized in Bubble. Conflicts stay on a temporary Bubble merge branch until resolved.
- `--resolve <key=to|from>`: resolve one conflict key (repeatable)
- `--resolve-all <to|from>`: resolve all conflicts the same way

---

## Workspace Lifecycle

### `buildprint sync [--no-merge] [--allow-suspicious-shrink] [--reset]`

Pull latest Bubble snapshot and merge into local workspace.

- `--no-merge`: update local Bubble snapshot only; skip merge into HEAD
- `--allow-suspicious-shrink`: allow sync when fetched snapshot is unexpectedly smaller than local
- `--reset`: explain how to reset this branch workspace to the latest Bubble snapshot (guarded/destructive)
- **Use intentionally** — for reconciling with Bubble editor state, not as a ritual before every read. Bubble editor changes by anyone are invisible locally until you sync.

### `buildprint sync status`

Show how the workspace relates to the latest fetched Bubble snapshot and the last applied Buildprint state.

### `buildprint check [paths...] [--auto-apply] [--rule <id>] [--level error|warning|info] [--json]`

Validate workspace files against Buildprint check rules. Checks **changed files by default**.

- `[paths...]`: only check these workspace-relative paths; directories include all files beneath them
- `--auto-apply`: apply the workspace automatically if this run returns no blocking errors
- `--rule <id>`: narrow to a rule (exact match or `'prefix/*'`)
- `--level`: minimum severity threshold (default: `info`)
- `--json`: structured JSON output for scripting
- **zsh note:** quote glob patterns to prevent shell expansion

### `buildprint apply [appId] [branch]`

Push committed local changes back to Bubble. Final step of the edit loop. Args are **optional** — defaults to workspace `app.json` and the current git branch.

- Requires a fresh successful full `buildprint check` for the current workspace state unless `--force-apply`.
- Reruns the internal check by default and auto-commits unapplied edits before applying.
- `--no-check`: skip rerunning the internal check pass (a fresh successful full check is still required unless `--force-apply`)
- `--allow-large-apply`: allow applying when the local Bubble base is tiny and the workspace is substantial
- `--force-apply`: bypass check freshness, internal validation, and large-apply safety gates (**forbidden unless user explicitly requests AND acknowledges what is bypassed**)
- **Refuses if:** branch folder name ≠ git branch name, error-level issues exist, or obvious size disparity — unless the matching bypass flag is set.

---

## Exploration

### `buildprint summary [--json]`

Top-level app overview: pages, mobile views, reusables, global elements, data types, option sets, styles, API connectors — with display names, Bubble IDs, and file paths.

### `buildprint tree <target> [--include <list>] [--cursor <n>]`

Element and workflow subtree for a page, reusable, mobile view, or element.

- `<target>`: folder key, friendly name, or Bubble ID
- `--include <list>`: comma-separated extras from: `text,types,ids,paths,layout,design,properties,workflows,actions` (default: `types,ids`)
- `--cursor <n>`: pagination offset (paginated at 250 lines)
- Tip: `--include properties,workflows` gives fastest functional understanding

### `buildprint context <target>`

Relationships for one node: contained by/contains, triggered by/triggers, references/referenced by, instantiates/instantiated by, plus 5 ancestors and 5 descendants.

- `<target>`: node ID, name, or file path
- More efficient than `tree` for single-node exploration

### `buildprint find <ids...> [--json]`

Resolve one or more Buildprint/Bubble IDs to workspace file paths.

- Example: `buildprint find page-home hero-id wf-submit action-0`
- Fastest path lookup when a changelog, issue, or Bubble reference gives you IDs

### `buildprint changelog <sourceBranch> <targetBranch> [-o <path>] [--json]`

Create a readable local changelog between two local branch workspaces for the **same app**.

- `-o, --output <path>`: write output to a file outside the compared branch workspaces (relative paths written from app root)
- Line item IDs can be resolved with `buildprint find`

### `buildprint schema [query] [--category <name>] [--action-type <type>] [--element-type <type>] [--limit <n>]`

Search Bubble's static schema — operators, actions, element types, workflows.

- `buildprint schema "append text"`
- `buildprint schema --category actions`
- `buildprint schema --action-type CreateThing`
- `buildprint schema --element-type Input`

### `buildprint docs buildprint "<query>" [--limit <n>]`

Search Buildprint help documentation (`--limit` default 5, max 50).

### `buildprint docs bubble`

Search Bubble.io documentation.

---

## Entity Creation

All `new` commands require a cloned workspace (run `buildprint init`/`project clone` first).

### Pages, Reusables, Mobile

```
buildprint new page --name "<Name>" [--copy <id-or-name>]
buildprint new reusable --name "<Name>" --element-type Group [--copy <id>]
buildprint new mobile_reusable --name "<Name>" --element-type Group
buildprint new mobile --name "<Name>"
```

### Global Expressions

```
buildprint new global-expression --name "<Name>"
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

### Actions

```
buildprint new action --path <wf-path> --type <ActionType> [--after <n>|--before <n>] [--name <name>]
```

- `--after <n>` and `--before <n>` are mutually exclusive (zero-indexed)

### Folders

```
buildprint new folder --path <path> --name "<name>"
```

### Project Tests (local, tests-as-code)

```
buildprint new test --name "<Name>" [--folder <name>]
buildprint new test-step --<...>   # append a step to a local test definition file
```

Run `buildprint new test --help` / `new test-step --help` for the current step flags. Fetch `testing/project-tests` before authoring tests.

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

## Components (reusable Buildprint packages)

Discover, package, and unpack reusable components. Fetch `components/installing` (use) or `components/authoring` (create) first.

```
buildprint components list [--json]
buildprint components search [query...] [--category <name>]
buildprint components categories
buildprint components add <component>     # download + unpack into .buildprint/components
buildprint components package             # package selected workspace files from library.json + component.json
```

- Alias: `buildprint component ...`
- Treat an added component as a canonical example to remap and integrate, not a one-click install.

---

## Browser & Visual

### `buildprint login <email> [--app <app>] [--branch <branch>] [--page <page>] [--session <name>] [--no-browser] [--json]`

Authenticate Agent Browser as a Bubble app user so manual checks / saved tests start already authenticated.

- `--version <version>`: alias for `--branch`
- `--page <page>`: page to open after login (default: `index`)
- `--no-browser`: do not install cookies into Agent Browser
- Do **not** use for tests that verify the visible login flow.

### `buildprint screenshot <email> <path> [--app <app>] [--version <version>] [--viewport desktop|tablet|mobile] [--output <png>] [--json]`

Capture an authenticated full-page Bubble run-mode screenshot.

- `path`: app-relative URL, e.g. `"/dashboard?tab=settings"`
- `--branch <branch>`: alias for `--version`
- **Run-mode only** — unapplied local edits will NOT appear; run `buildprint apply` first to see your changes.

---

## Database (read-only Bubble records)

Reads live/test Bubble DB rows — not local workspace files. Inside a workspace, `--app` defaults to `.buildprint/app.json` and `--version` to the current git branch. Outside, pass both. Fetch `data/retrieving-database-data` first.

```
buildprint data search [type] --constraint 'field=.. op=.. value=..' [--sort ...] [--n <k>] [--from <i>]
buildprint data fetch '["<uniqueId>", ...]'
buildprint data aggregate [type] --constraint '...' --fn 'fn=count' [--fn 'fn=sum field=amount']
```

---

## Test Users

Manage Buildprint test users for the current workspace app.

```
buildprint test-user list [--json]
buildprint test-user get <id>
buildprint test-user create --name "<Name>" --database test --email <email> [--password-stdin]
buildprint test-user update <id> [--email <email>] [--disable]
buildprint test-user delete <id>
```

- Pass secrets via stdin: `printf "%s" "$PASSWORD" | buildprint test-user create ... --password-stdin`

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

Checks: data types without privacy rules, public read/search/attachment/field access, unprotected backend workflows, public file/image uploads, frontend temp-password ops, insecure page redirects, exposed API secrets.

- `--json`: `{ message, results: [{ check, title, message, fix, severity, path }] }`

---

## MCP Integration

### `buildprint mcp install [--client <clients>] [--name <serverName>] [--token <token>] [--dry-run] [--json]`

Install the Buildprint MCP server into local AI clients.

- `--client`: comma-separated `cursor, codex, claude-code, claude-desktop, opencode, all`
- `--name`: MCP server name (default: `buildprint`)
- `--token`: use an existing MCP bearer token instead of creating one
- `--dry-run`: preview target config files without creating a token or writing files
- New MCP servers connect only on the next session start of the target client.

See SKILL.md "CLI vs MCP" for which surface owns which task.

---

## Utilities

### `buildprint utils generate-ids <n>`

Generate n fresh Bubble-compatible IDs (1–100 per call). IDs are in lexicographic order.

### `buildprint quickstart`

Print the full Buildprint agent playbook (workspace layout, commands, conventions). Read once per session.

### `buildprint guidelines list`

List all available guideline paths and descriptions.

### `buildprint guidelines get <path> [<path>...]`

Fetch one or more guideline documents in one call.

- Example: `buildprint guidelines get general editing/apps schema/data-type`

### `buildprint update [--check]`

Update the globally installed Buildprint CLI from npm. `--check`: check for a newer version without installing. (Equivalent: `npm install -g buildprint@latest`.)
