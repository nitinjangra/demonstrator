# Changelog

## [1.4.0] - 2026-11-20

### Features

- add loading indicator with delay for better user experience
- keep scenario edits preview-only
- add language switching and RTL layout
- improve table urgency and pagination
- add actionable empty chart state (#73)
- limit rows for standard profiles (#72)
- show content loading feedback (#71)
- refine navigation and page layouts (#70)
- add shared accessible breadcrumb (#69)
- add published announcement fixtures (#68)
- support drafts scheduling and attachments (#67)
- warn before leaving unsaved changes (#66)
- support organization logo and text header (#64)
- add tenant-scoped profiles and role guards (#65)
- enhance empty states and user settings integration across components
- implement mock data driver component and feature toggle
- improve action tables and announcement empty states

### Fixes

- address CodeRabbit findings for PR #63
- update chart descriptions and action link for clarity
- address announcement and dashboard feedback

### Documentation

- align project docs with Angular demo

### Refactoring

- share priority query parsing

### Tests

- improve coverage for settings and table flows (#74)
- raise announcement coverage above threshold
- cover route guard and hold directive
- enforce coverage thresholds in karma
- cover dashboard and settings workflows
- cover announcement settings save flow
- add Jasmine coverage for app components

### Chores

- configure formatting and pre-commit tooling
- add MCP configuration
- remove obsolete eslint ignore file

### Other Changes

- style: improve SCSS formatting and adjust z-index values for focus backdrop
- style: format codebase with Prettier
- ci: gate GitHub Pages deployment on project checks
- build(deps): bump the npm_and_yarn group across 1 directory with 3 updates
- build(deps): bump fast-uri
- style(settings): align page and sidebar layouts
- style(announcements): refine editor dialog spacing
- style(material): use app theme colors for controls
- style: group landing widgets in cards
- Revert "feat: add version check and improve changelog generation in release script"
- build(deps): bump @modelcontextprotocol/server

## [1.3.0] - 2026-11-03

### Features

- announce action filter navigation
- add action drilldown and table pagination
- add announcement management workflows
- add settings overview and save workflows
- add configurable actions dashboard
- add status field to announcements and update related tests
- enhance announcement dialog with date range input and status management
- refactor actions table and material table to use PrioritySummary component for priority filtering
- add announcement creation and settings
- add filterable priority counts to actions tables
- add version check and improve changelog generation in release script

### Fixes

- update chart descriptions and action link for clarity
- address announcement and dashboard feedback

### Refactoring

- share priority query parsing

### Tests

- raise announcement coverage above threshold
- cover route guard and hold directive
- enforce coverage thresholds in karma
- cover dashboard and settings workflows
- cover announcement settings save flow
- add Jasmine coverage for app components

### Chores

- add MCP configuration
- remove obsolete eslint ignore file

### Other Changes

- style(settings): align page and sidebar layouts
- style(announcements): refine editor dialog spacing
- style(material): use app theme colors for controls
- style: group landing widgets in cards
- Revert "feat: add version check and improve changelog generation in release script"
- build(deps): bump @modelcontextprotocol/server

# Changelog

## [1.2.0] - 2026-10-13

### Features

- enhance matchMedia mock in theme component tests for better theme preference handling
- add tooltip for theme toggle button and enhance unit tests
- add unit tests for various components and services, enhance existing tests
- improve landing and announcements experience
- add dashboard and persistent settings
- add configurable actions table implementations
- add GitHub Actions workflow for deploying to GitHub Pages
- update dependencies and ESLint configuration for improved linting and compatibility
- address the landing page feedback
- add ag grid table for actions (#14)

### Tests

- enhance unit tests for various components and services

### Chores

- update Angular dependencies to version 22.2.1 and other devDependencies
- add .agents to ignorelist

### Other Changes

- Merge pull request #37 from nitinjangra/development
- Merge pull request #33 from nitinjangra/dev-to-master
- build(deps): bump webpack-dev-server (#24)
- build(deps-dev): bump fast-uri
- Merge pull request #20 from nitinjangra/dev-to-master
- release script introduction & release v1.1.0 (#19)
- Fb/global header theme toggle button (#13)
- Commit current workspace changes
- build(deps): bump the npm_and_yarn group across 1 directory with 4 updates (#3)
- announcements components underhood improvements (#11)

# Changelog

All notable changes to this project will be documented here.

## [1.1.0] - 2026-07-21

### Features

- add release script for automated changelog and release process
- add ag grid table for actions (#14)

### Other Changes

- Fb/global header theme toggle button (#13)
- Commit current workspace changes
- build(deps): bump the npm_and_yarn group across 1 directory with 4 updates (#3)
- announcements components underhood improvements (#11)
- Initial commit

## [1.0.0] - 2026-07-01

### Features

- bootstrap the demonstrator app (#2)
