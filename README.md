# buildprint-cli

A Claude Code plugin that gives Claude the workflow, safety guardrails, and command reference to effectively use the [Buildprint CLI](https://buildprint.ai) for Bubble.io app development.

## What it does

When you work with Bubble.io apps via the Buildprint CLI, this plugin:

- Enforces the canonical workflow: **sync → explore → fetch guidelines → edit → check → apply**
- Fetches the right Buildprint guidelines before each type of edit (data types, workflows, privacy rules, etc.) using `buildprint guidelines get`
- Provides a cached CLI command reference so Claude doesn't call `--help` repeatedly
- Enforces safety guardrails: no `--no-check`, savepoints before structural changes, explicit confirmation before live deployments

## Why

When using Buildprint on the web, the platform automatically injects rich context before every agent call — Bubble's entity model, valid action types, security patterns, workflow guardrails. On the CLI, Claude sees only JSON files. This plugin replicates that context injection experience.

## Requirements

- [Buildprint CLI](https://docs.buildprint.ai/cli/installation-and-authentication-iwixh) installed and authenticated
- Claude Code

## Installation

In any Claude Code session, run:

```
/plugin marketplace add rafachavantes/using-buildprint-cli
/plugin install buildprint-cli@buildprint-cli
/reload-plugins
```

The plugin is then available in every project directory.

> Note: the shell `claude plugin install <url>` command does **not** accept GitHub URLs. Marketplace registration only works through the TUI slash commands above.

## Setup

```bash
npm install -g buildprint
buildprint link <your-token>   # Token: Buildprint → Integrations → CLI
buildprint project list        # Verify auth
```

## Typical session

```bash
buildprint project clone <appId> --branch test
cd my-app/test
# Claude activates the skill automatically from here
```

## Links

- [Buildprint docs](https://docs.buildprint.ai)
- [Buildprint CLI reference](https://docs.buildprint.ai/cli/installation-and-authentication-iwixh)
- [Bubble.io](https://bubble.io)
