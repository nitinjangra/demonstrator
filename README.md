# Demonstrator

[![CI](https://github.com/nitinjangra/demonstrator/actions/workflows/ci.yml/badge.svg)](https://github.com/nitinjangra/demonstrator/actions/workflows/ci.yml)

A simple Angular demonstration project with source code, styles, and tooling configured for development, testing, and linting.

## Project overview

- Angular version: 21.x
- TypeScript version: 5.9.x
- Build system: Angular CLI / `@angular/build`
- Linting: ESLint
- Formatting: Prettier

## Prerequisites

- Node.js 20+ and npm 10+
- Git

## Setup

```bash
npm install
```

## Continuous integration

Run the reusable CI script locally as:

```bash
npm run ci
```

## Development

Run the local development server:

```bash
npm start
```

Then open the app in your browser at:

```text
http://localhost:4200
```

## Build

Build the application for production:

```bash
npm run build
```

## Tests

Run unit tests with Karma:

```bash
npm test
```

## Linting

Check TypeScript and Angular source files:

```bash
npm run lint
```

## Continuous integration

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.
The CI job runs on `push` and `pull_request` for the `development` branch and executes:

- `npm ci`
- `npm run lint`
- `npm test -- --watch=false --browsers=ChromeHeadless`

## Repository structure

- `src/` — application source files
- `src/app/` — Angular app components, routes, services, and shared modules
- `src/assets/` — static asset files
- `src/styles.scss` — global styles
- `angular.json` — Angular workspace and build configuration
- `.eslintrc.json` — ESLint configuration
- `.prettierrc` — Prettier formatting rules

## Contributing

1. Fork the repository
2. Create a branch for your feature or fix
3. Install dependencies and run tests locally
4. Submit a pull request with a clear description of your changes

## License

This repository is licensed under the GNU General Public License v3. See `LICENSE` for details.
