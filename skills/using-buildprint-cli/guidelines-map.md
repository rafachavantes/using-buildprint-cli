# Buildprint Guidelines Routing Map

Fetch the right guidelines before editing. Wrong or missing guidelines are the leading cause of apply failures.

---

## Always — Every Session Start

```
buildprint guidelines get general
```

Run this before any other work. It establishes the app context model, traversal rules, and editing invariants that all other guidelines build on.

---

## Task → Guidelines Table

| Task                           | Command                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Editing any file               | `buildprint guidelines get editing/apps`                                               |
| UI / pages / elements / styles | `buildprint guidelines get editing/apps editing/frontend editing/frontend/expressions` |
| Frontend migration             | `buildprint guidelines get editing/frontend migrating/frontend`                        |
| Data types                     | `buildprint guidelines get schema/data-type editing/apps`                              |
| Option sets                    | `buildprint guidelines get schema/option-set`                                          |
| Workflows (general)            | `buildprint guidelines get schema/workflow schema/action`                              |
| Backend / API workflows        | `buildprint guidelines get workflows/backend schema/workflow`                          |
| Custom events                  | `buildprint guidelines get workflows/custom-events`                                    |
| Database triggers              | `buildprint guidelines get workflows/database-triggers`                                |
| Dynamic expressions            | `buildprint guidelines get schema/dynamic-expression editing/frontend/expressions`     |
| API Connector                  | `buildprint guidelines get schema/api-connector`                                       |
| Stripe / billing               | `buildprint guidelines get cookbooks/stripe schema/api-connector`                      |
| Refactoring into reusables     | `buildprint guidelines get cookbooks/refactoring-into-reusables`                       |
| Privacy rules / access control | `buildprint guidelines get security/privacy-rules security/bubble`                     |
| Security review / audit        | `buildprint guidelines get security/bubble security/privacy-rules`                     |
| Live data investigation        | `buildprint guidelines get data/retrieving-database-data`                              |
| Log investigation              | `buildprint guidelines get logs/searching`                                             |
| Workload analysis              | `buildprint guidelines get workload/unit-analysis`                                     |
| Monitors                       | `buildprint guidelines get monitors`                                                   |
| Browser automation             | `buildprint guidelines get browser/agent-browser`                                      |
| Project tests                  | `buildprint guidelines get testing/project-tests`                                      |

---

## High-Risk Task Rule

After fetching guidelines for any of these tasks:

- Privacy rules / access control
- Security review / audit
- Data types (schema changes)
- Backend / API workflows

**Summarize the key constraints to the user before editing.** Do not proceed until the user acknowledges. This prevents irreversible schema or privacy mistakes.

---

## Discover All Available Paths

```
buildprint guidelines list
```

Run this if the task doesn't match any row above or if you're unsure which guidelines apply. The output lists all current paths with descriptions.
