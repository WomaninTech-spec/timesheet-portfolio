# Timesheet — Portfolio Case Study

> ⚠️ **This is a portfolio write-up, not the original source code.**
> This repository describes, from memory and in my own words, an internal
> time-tracking tool I contributed to as a full-stack developer during my time
> at PrestaShop. The proprietary source code, credentials, and company data
> remain the property of PrestaShop and are **not** reproduced here. This
> document only summarizes the problem, the architecture, and my personal
> contribution, for portfolio purposes.

## Context

Finance and engineering leadership needed a way to reconcile time spent on
Jira issues with actual delivery categories (Maturation vs. Build), broken
down per person and per squad, on a monthly basis — plus a way to fold in
GitHub activity alongside Jira worklogs.

## What the tool did

- **Pivot table**: aggregated time spent per person and per Jira space,
  split between "Maturation" and "Build" work categories.
- **Monthly summary**: an auto-generated per-person activity summary derived
  from epic and issue titles.
- **Daily tracking view**: a day-by-day worklog heatmap per squad.
- **GitHub activity overlay**: merged GitHub-sourced time entries alongside
  Jira worklog data for a fuller picture of contribution.
- **Export**: pivot tables and summaries could be exported as CSV/HTML for
  reporting.

## Architecture (high level)

- A small **Node.js/Express local proxy server** handled CORS and forwarded
  authenticated calls to the Jira Cloud API (and optionally the GitHub API).
- A **single-page front end** (vanilla HTML/JS) rendered the pivot tables,
  summaries, and heatmaps client-side from the data returned by the proxy.
- Credentials (Jira token, optional GitHub token) were entered by the user
  at runtime and kept in `sessionStorage` for the duration of the browser
  session — nothing was persisted server-side, and the app was designed to
  run locally rather than be deployed.
- A Backstage catalog descriptor documented the service for the internal
  developer portal.

## My contribution

I worked on this as a **full-stack developer**: front-end work on the
pivot/summary UI logic and layout, and back-end work on the Express proxy
server that talked to the Jira and GitHub APIs. I also contributed fixes
around credential handling (removing hardcoded values in favor of
environment variables) and cleanup of the service catalog metadata.

## Skills demonstrated

- Node.js / Express (lightweight API proxying, CORS handling)
- Front-end data visualization (pivot tables, heatmaps) without a heavy
  framework
- Third-party API integration (Jira Cloud REST API, GitHub API)
- Secure-by-default credential handling (env vars, session-only storage,
  no server-side persistence)
- Internal developer-portal documentation (Backstage catalog descriptors)

---

*This write-up is shared for portfolio purposes only. No proprietary code,
credentials, or business data from PrestaShop is included.*
