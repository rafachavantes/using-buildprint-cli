# buildprint-cli

A plugin that gives AI coding agents the workflow, safety guardrails, and v5 guidance to work with the [Buildprint CLI](https://buildprint.ai) on Bubble.io apps. Works with Claude Code, OpenAI Codex CLI, and OpenCode.

## What it does

When you work with Bubble.io apps through the Buildprint CLI v5, this plugin:

- Teaches task-dependent BubbleScript workspace work: clone only when needed, apply validates, sync only for drift
- Routes each task to the current guideline with `buildprint guidelines <name>` — UI, database, expressions, workflows, API Connector, testing, and more
- Carries the safeguards the CLI relies on you for: target-specific authorization, Live protection, credential redaction, and savepoint discipline
- Points to the installed CLI as the authority: `buildprint quickstart`, `buildprint <command> --help`, and generated workspace declarations

## Why

When using Buildprint on the web, the platform injects rich context before every agent call — Bubble's entity model, valid action types, security patterns, workflow guardrails. On the CLI, the agent sees a BubbleScript workspace and the installed CLI's own documentation. This plugin instructs the agent to use current v5 interfaces and follow safeguards that are easy to skip.

## Requirements

- [Buildprint CLI](https://docs.buildprint.ai/cli/installation-and-authentication-iwixh) v5 installed and authenticated. The plugin's safeguards target CLI major 5; if another major is installed, the skill instructs the agent to report the mismatch and ask the owner before proceeding.
- Claude Code, [OpenAI Codex CLI](https://github.com/openai/codex), or [OpenCode](https://opencode.ai)

The plugin version is independent of the CLI version. Plugin 0.4.0 supports Buildprint CLI 5.x.

## Installation

### Claude Code

In any Claude Code session, run:

```
/plugin marketplace add rafachavantes/using-buildprint-cli
/plugin install buildprint-cli@buildprint-cli
/reload-plugins
```

### Codex CLI

```bash
codex plugin marketplace add rafachavantes/using-buildprint-cli
```

Then open `/plugins` in Codex CLI and install `buildprint-cli`.

### OpenCode

Add the plugin to the `plugin` array in your `opencode.json` (global at `~/.config/opencode/opencode.json`, or project-level):

```json
{
  "plugin": ["buildprint-cli@git+https://github.com/rafachavantes/using-buildprint-cli"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager (via Bun) and registers its skill directory so `using-buildprint-cli` is discoverable through the native `skill` tool — no symlinks or manual copies. See [`.opencode/INSTALL.md`](.opencode/INSTALL.md) for migration, update, and troubleshooting notes.

> **Note:** All three clients use the same bundled skill; installation differs by client.

## Setup

Owner-run, once per machine:

```bash
npm install -g buildprint@5
buildprint link          # opens the browser sign-in; no token pasting needed
buildprint --version     # confirm CLI v5
```

## Typical session

```bash
buildprint quickstart                                   # read once; it is the current playbook
buildprint project list                                 # find the app
buildprint project clone <appId> --branch <branch>      # clone only when you need a workspace
cd <the workspace path printed by project clone>
buildprint guidelines <name>                            # fetch only the guideline the task needs
```

A read-only question needs no apply or write: inspect the workspace and answer. An authorized development edit may edit the BubbleScript source and run `buildprint apply` directly, which validates the changed files; address any blocking diagnostics before retrying. Sync is for reconciling editor drift, not a required first step. The skill instructs the agent to fetch the relevant guideline and stop when target authorization is missing.

## Links

- [Buildprint docs](https://docs.buildprint.ai)
- [Buildprint CLI reference](https://docs.buildprint.ai/cli/installation-and-authentication-iwixh)
- [Bubble.io](https://bubble.io)
