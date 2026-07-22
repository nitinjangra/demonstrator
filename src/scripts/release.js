#!/usr/bin/env node
/**
 * release.js
 *
 * Bumps the version in package.json, generates/updates CHANGELOG.md from
 * git commit history since the last tag, commits, and creates a git tag.
 *
 * Usage:
 *   node scripts/release.js patch   # 1.2.3 -> 1.2.4
 *   node scripts/release.js minor   # 1.2.3 -> 1.3.0
 *   node scripts/release.js major   # 1.2.3 -> 2.0.0
 *   node scripts/release.js 1.5.0   # set an explicit version
 *
 * Flags:
 *   --dry-run   Show what would happen without changing any files or git state
 *   --no-push   Commit and tag locally but don't push
 *
 * Requirements: Node.js, git, and a package.json in the current directory.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CWD = process.cwd();
const PKG_PATH = path.join(CWD, "package.json");
const CHANGELOG_PATH = path.join(CWD, "CHANGELOG.md");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noPush = args.includes("--no-push");
const bumpArg = args.find((a) => !a.startsWith("--"));

function run(cmd, options = {}) {
  return execSync(cmd, { encoding: "utf8", cwd: CWD, ...options }).trim();
}

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

function log(msg) {
  console.log(msg);
}

// --- 1. Pre-flight checks -------------------------------------------------

if (!fs.existsSync(PKG_PATH)) {
  fail("No package.json found in the current directory.");
}

let isGitRepo = true;
try {
  run("git rev-parse --is-inside-work-tree");
} catch {
  isGitRepo = false;
}
if (!isGitRepo) fail("Not inside a git repository.");

const statusOutput = run("git status --porcelain");
if (statusOutput && !dryRun) {
  fail(
    "Working tree is not clean. Commit or stash changes before releasing:\n\n" +
      statusOutput
  );
}

// --- 2. Determine current and next version --------------------------------

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf8"));
const currentVersion = pkg.version;
if (!currentVersion) fail("package.json has no \"version\" field.");

if (!bumpArg) {
  fail("Specify a bump type: patch, minor, major, or an explicit version (e.g. 1.5.0).");
}

function bumpVersion(current, bump) {
  const semverRe = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/;
  const match = current.match(semverRe);
  if (!match) fail(`Current version "${current}" is not valid semver.`);
  let [, major, minor, patch] = match.map((v, i) => (i === 0 ? v : Number(v) || v));

  if (/^\d+\.\d+\.\d+$/.test(bump)) {
    return bump; // explicit version passed in
  }

  switch (bump) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      fail(`Unknown bump type "${bump}". Use patch, minor, major, or an explicit version.`);
  }
}

const nextVersion = bumpVersion(currentVersion, bumpArg);
const tagName = `v${nextVersion}`;

// Refuse to reuse an existing tag
const existingTags = run("git tag --list").split("\n").filter(Boolean);
if (existingTags.includes(tagName)) {
  fail(`Tag ${tagName} already exists.`);
}

log(`\nCurrent version: ${currentVersion}`);
log(`Next version:    ${nextVersion}`);

// --- 3. Gather commits since the last tag for the changelog ---------------

let lastTag = "";
try {
  lastTag = run("git describe --tags --abbrev=0");
} catch {
  lastTag = ""; // no previous tags
}

const logRange = lastTag ? `${lastTag}..HEAD` : "HEAD";
let commits = [];
try {
  const rawLog = run(`git log ${logRange} --pretty=format:%s`);
  commits = rawLog ? rawLog.split("\n").filter(Boolean) : [];
} catch {
  commits = [];
}

if (commits.length === 0) {
  log("\n⚠ No new commits found since the last tag — changelog entry will be minimal.");
}

// Group commits by conventional-commit type where possible
const groups = {
  feat: [],
  fix: [],
  docs: [],
  chore: [],
  refactor: [],
  perf: [],
  test: [],
  other: [],
};

const typeRe = /^(feat|fix|docs|chore|refactor|perf|test)(\(.+\))?:\s*(.+)$/;
for (const c of commits) {
  const m = c.match(typeRe);
  if (m) {
    groups[m[1]].push(m[3]);
  } else {
    groups.other.push(c);
  }
}

const sectionTitles = {
  feat: "Features",
  fix: "Fixes",
  docs: "Documentation",
  refactor: "Refactoring",
  perf: "Performance",
  test: "Tests",
  chore: "Chores",
  other: "Other Changes",
};

const today = new Date().toISOString().split("T")[0];
let changelogEntry = `## [${nextVersion}] - ${today}\n\n`;

let hasContent = false;
for (const key of Object.keys(sectionTitles)) {
  if (groups[key].length > 0) {
    hasContent = true;
    changelogEntry += `### ${sectionTitles[key]}\n`;
    for (const item of groups[key]) {
      changelogEntry += `- ${item}\n`;
    }
    changelogEntry += "\n";
  }
}
if (!hasContent) {
  changelogEntry += "- No notable changes recorded.\n\n";
}

// --- 4. Preview in dry-run mode --------------------------------------------

if (dryRun) {
  log("\n--- DRY RUN: no files changed, nothing committed or tagged ---\n");
  log(`package.json version would become: ${nextVersion}`);
  log(`\nCHANGELOG.md entry that would be added:\n`);
  log(changelogEntry);
  process.exit(0);
}

// --- 5. Write package.json --------------------------------------------------

pkg.version = nextVersion;
fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n");
log(`\n✔ Updated package.json to ${nextVersion}`);

// Keep package-lock.json in sync if present
const lockPath = path.join(CWD, "package-lock.json");
if (fs.existsSync(lockPath)) {
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    lock.version = nextVersion;
    if (lock.packages && lock.packages[""]) {
      lock.packages[""].version = nextVersion;
    }
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
    log("✔ Updated package-lock.json version field");
  } catch {
    log("⚠ Could not update package-lock.json automatically — check it manually.");
  }
}

// --- 6. Write CHANGELOG.md --------------------------------------------------

let existingChangelog = "";
if (fs.existsSync(CHANGELOG_PATH)) {
  existingChangelog = fs.readFileSync(CHANGELOG_PATH, "utf8");
} else {
  existingChangelog = "# Changelog\n\nAll notable changes to this project will be documented here.\n\n";
}

// Insert the new entry right after the top header/description, before any prior entries
const headerMatch = existingChangelog.match(/^# Changelog\n[\s\S]*?\n\n/);
let updatedChangelog;
if (headerMatch) {
  updatedChangelog =
    existingChangelog.slice(0, headerMatch[0].length) +
    changelogEntry +
    existingChangelog.slice(headerMatch[0].length);
} else {
  updatedChangelog = `# Changelog\n\n${changelogEntry}${existingChangelog}`;
}

fs.writeFileSync(CHANGELOG_PATH, updatedChangelog);
log("✔ Updated CHANGELOG.md");

// --- 7. Commit and tag -------------------------------------------------------

run(`git add package.json package-lock.json CHANGELOG.md 2>/dev/null || git add package.json CHANGELOG.md`);
run(`git commit -m "chore: release ${tagName}"`);
log(`✔ Committed release ${tagName}`);

run(`git tag -a ${tagName} -m "Release ${tagName}"`);
log(`✔ Created tag ${tagName}`);

// --- 8. Push (unless disabled) -----------------------------------------------

if (noPush) {
  log(`\nSkipping push (--no-push passed). Run manually when ready:`);
  log(`  git push && git push origin ${tagName}`);
} else {
  run("git push");
  run(`git push origin ${tagName}`);
  log(`✔ Pushed commit and tag ${tagName}`);
}

log(`\n🎉 Release ${tagName} complete.\n`);