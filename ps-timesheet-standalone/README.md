# PS TimeSheet — standalone

A from-scratch, independent reimplementation of the PS TimeSheet worklog-pivot logic: fetch Jira worklogs for a date range, categorize them, and turn them into a per-person / per-project pivot and summary — with no dependency on any internal platform.

This is the **portfolio companion** to the [production writeup](../README.md): same business logic (categorization rules, 7.8h/day conversion, pivot shape, 30-minute caching strategy), rebuilt as a plain Node.js + Express app that runs against any Jira Cloud instance.

## Why this exists

The real PS TimeSheet is a Backstage plugin wired into an internal Developer Portal, an internal Jira instance, and internal secrets — it can't be cloned and run outside that environment. This standalone version proves out the same logic (Jira API integration, categorization, aggregation, caching) as a project anyone can clone, configure with their own Jira credentials, and run.

## What it does

- Fetches every Jira issue with a worklog entry in a chosen month range (via JQL `worklogDate`)
- Categorizes each issue: Epic / Spike / any "opportunit*" type → **Maturation**; Story / Subtask / Improvement → **Build**; anything else is ignored
- Builds a **pivot**: space (Jira project) × person × month, with expandable rows in the UI
- Builds a **summary**: per person, aggregated over the full range, with a Maturation/Build distribution bar
- Converts logged seconds to days using the same convention as production: **1 day = 7.8 hours**
- Caches results in memory for a configurable TTL (default 30 min) to avoid re-querying Jira on every page load
- Exports the pivot or the summary as CSV

## Tech stack

- **Backend**: Node.js 18+, Express, native `fetch` for the Jira REST API (v3) calls
- **Frontend**: single HTML file, vanilla JS — no build step, no framework
- **Tests**: Node's built-in test runner (`node --test`), no extra test dependency

## Project structure

```
.
├── server.js              # Express app: routes, wiring, caching
├── src/
│   ├── jiraClient.js      # Jira REST API v3 client (search + worklog fetch, paginated)
│   ├── categorize.js      # Maturation / Build categorization rule
│   ├── pivot.js            # Aggregation: worklogs -> pivot + summary, in days
│   ├── dateUtils.js        # "YYYY-MM" range <-> concrete start/end dates
│   └── cache.js             # In-memory TTL cache (drop-in swappable for Redis)
├── public/index.html       # Pivot / Summary UI, CSV export buttons
├── test/                   # Unit tests for categorization, dates and pivot aggregation
└── .env.example
```

## Getting started

### 1. Clone and install

```bash
git clone <YOUR_REPO_URL>
cd ps-timesheet-standalone
npm install
```

### 2. Configure your Jira credentials

```bash
cp .env.example .env
```

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=your_jira_api_token
CACHE_TTL_MINUTES=30
PORT=8080
```

Generate a Jira API token at: https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Run it

```bash
npm start
```

Go to [http://localhost:8080](http://localhost:8080) — pick a month range and click **Load**.

### 4. Run the tests

```bash
npm test
```

12 unit tests cover the categorization rule, month-range date math, and pivot aggregation (including edge cases: worklogs just outside the range, untracked issue types, missing display names) — run against a fake Jira client, no network calls or real credentials needed.

## Notes on scope

- No database: results are cached in memory only, per process — fine for a single-user local tool, not for a multi-instance deployment (that's exactly what Redis does in production).
- No auth screen: this is a local single-user tool; credentials come from `.env`, not from a login form.
- Not a byte-for-byte copy of the production plugin (different runtime, no Backstage, no Redis) — it's a faithful reimplementation of the same business logic, built to demonstrate the reasoning independently of the internal platform it normally runs inside.
