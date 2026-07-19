# Contributing to ngx-liquid-glass

Thank you for helping improve `ngx-liquid-glass`. Bug reports, documentation improvements, compatibility fixes, and focused feature proposals are welcome.

## Before opening an issue

- Search existing issues to avoid duplicates.
- Confirm the problem using a supported Angular version.
- Test against the latest published `ngx-liquid-glass` release.
- For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Local development

Requirements:

- Node.js 20.19 or newer compatible release
- npm 10 or newer
- A Chromium-based browser for the headless unit tests

Install dependencies and run the core checks:

```bash
npm ci
npm run build:library
npm run test:library
npm run build:demo
npm run check:package
```

Run `npm start` to open the demo during visual development.

## Pull requests

1. Create a focused branch from `main`.
2. Keep changes narrowly scoped and add tests for observable behavior.
3. Update the package README when public inputs or behavior change.
4. Add a concise entry under `Unreleased` in `CHANGELOG.md` for user-facing changes.
5. Run all core checks before submitting the pull request.
6. Complete the pull-request template and include screenshots for visual changes.

Do not commit generated `dist`, coverage, or dependency directories. Maintainers determine package versions and publish releases after changes are merged.

## Coding guidelines

- Preserve strict TypeScript and Angular template checking.
- Keep the library standalone, tree-shakeable, SSR-safe, and dependency-light.
- Access browser globals only behind Angular platform checks.
- Avoid polling, unnecessary layout reads, and per-instance global resources.
- Preserve readable fallbacks when visual browser features are unavailable.
- Follow the existing formatting and naming conventions.

## Commit and review expectations

Use clear, imperative commit messages. Reviews consider correctness, public API stability, accessibility, browser behavior, performance, package size, and maintainability.

By contributing, you agree that your contribution is licensed under the project's MIT License.
