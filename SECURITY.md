# Security policy

## Reporting a vulnerability

Please report security problems privately through
[GitHub private vulnerability reporting](https://github.com/soroban-forge-labs/soroban-lens/security/advisories/new)
rather than a public issue. You should get a reply within 72 hours.

## Supply-chain safety for contributors

On 2026-10-22, malware reached `main` through a pull request. See
[docs/security/2026-10-22-polinrider.md](docs/security/2026-10-22-polinrider.md)
for what happened, who may be affected and what to do.

To keep this from happening again:

- **Every PR runs the malware guard** (`.github/workflows/malware-guard.yml`).
  A PR that adds `.vscode/tasks.json`, auto-run editor settings, npm install
  hooks, files named like fonts that contain text, or code hidden behind long
  runs of whitespace fails and is not merged.
- **Keep PRs to the files the issue needs.** A PR that touches unrelated
  files, especially editor config, `package.json` scripts, fonts or binary
  assets, will be closed.
- **Protect yourself.** Do not open any repository in VS Code or Cursor with
  automatic tasks allowed until you trust it. Set
  `"task.allowAutomaticTasks": "off"` in your user settings. Review
  `package.json` scripts before running `npm install` or `npm run`.
