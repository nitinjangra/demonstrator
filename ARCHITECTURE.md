# Architecture

## Scope

Demonstrator is a static Angular application. It has no server API, authentication provider, or server-side data store. Its sample records and user preferences are managed in the browser for demonstration purposes.

## Application structure

- **Application shell:** `src/app/app.ts` and `src/app/app.routes.ts` provide the root view and route configuration.
- **Feature components:** standalone components under `src/app/components/` implement the landing page, optional dashboard, action tables, announcements, and settings.
- **Shared UI and behavior:** `src/app/shared/` contains common components, directives, domain types, mock records, and services for preferences, themes, feature toggles, and table state.
- **Styling:** global theme and base styles are in `src/styles.scss`; feature styles live alongside their components.
- **Build and tests:** Angular CLI configuration is in `angular.json`; Karma configuration and coverage thresholds are in `karma.conf.cjs`.

## Navigation and demo profiles

Routes load feature components lazily. Local profile checks and feature toggles can hide demo screens or redirect navigation. They are client-side presentation behavior only. They do not protect real data and must not be used as authorization in a deployed service.

## Data flow

Feature components use shared services to read and update in-memory sample data and browser-local preferences. The mock data driver provides an isolated preview of sample content. No production API contract or persistence layer is implemented.

## Production boundary

The build can be hosted as a static demonstration site. Before adapting it for real users or sensitive data, add a trusted backend, authentication, server-side authorization, tenant isolation, input validation, and appropriate operational monitoring. Client-side route guards may remain for user experience, but the server must enforce every access decision.

## Verification

Run `npm run ci` to lint, check Prettier formatting, run unit tests with configured coverage thresholds, and create the production build. GitHub Actions runs the same checks for changes targeting `development` or `master`; the Pages deployment workflow runs the checks before publishing.
