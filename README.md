# Demonstrator

[![CI](https://github.com/nitinjangra/demonstrator/actions/workflows/ci.yml/badge.svg)](https://github.com/nitinjangra/demonstrator/actions/workflows/ci.yml)

An Angular demo workspace for exploring an actions dashboard, announcements, configurable tables, and application settings. It uses sample data and browser-local preferences; it does not connect to a production API.

## Features

- Landing page with announcements and an actions table.
- Actions table implementations using Angular Material and AG Grid, with sorting and priority filtering.
- Optional dashboard with action summaries and charts.
- Settings for branding, theme, language, date and time, notifications, announcements, and feature toggles.
- Mock data driver for previewing sample content.
- Responsive layouts, accessible labels and status announcements, and right-to-left layout support.

## Demo security boundary

User profiles and role-aware navigation are simulated in browser storage. Route guards and feature toggles only shape the demo interface; they do not authorize access to protected data or operations. The app has no backend or real authentication. Do not use it to handle sensitive data or as an authorization boundary. A production service needs trusted identity and server-side authorization for every protected operation.

## Requirements

- Node.js 22.22.3 (the version used by CI)
- npm 10.9.3 (the version declared by `packageManager`)
- Git

## Getting started

```bash
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Common commands

| Command                | Purpose                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm start`            | Run the development server.                                                                                    |
| `npm run build`        | Create an optimized production build in `dist/demonstrator/browser`.                                           |
| `npm test`             | Run unit tests with Karma.                                                                                     |
| `npm run lint`         | Lint the repository with ESLint.                                                                               |
| `npm run format`       | Format supported files with Prettier.                                                                          |
| `npm run format:check` | Check formatting without changing files.                                                                       |
| `npm run ci`           | Audit dependencies, lint, check formatting, run unit tests with coverage thresholds, and build for production. |

Git commits run ESLint and Prettier on staged source files through Husky and lint-staged.

## Deployment

The GitHub Pages workflow builds and deploys the static app from `master`. The production build uses `/demonstrator/` as its base path. The workflow can also be started manually from GitHub Actions.

## Project layout

- `src/app/components/` — landing page, dashboard, actions tables, announcements, and settings.
- `src/app/shared/` — shared components, services, types, mock data, and styles.
- `src/styles.scss` — global styles.
- `public/` — static files copied to the build output.
- `ARCHITECTURE.md` — current app boundaries and data flow.
- `CHANGELOG.md` — release history.

## License

GNU General Public License v3. See [LICENSE](./LICENSE).
