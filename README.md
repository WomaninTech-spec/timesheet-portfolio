# PS TimeSheet

Internal time-tracking tool that pulls Jira worklogs and builds a monthly pivot table for finance and dev reporting.

## What it does

- **Pivot table** — time spent per person, per Jira space, split between Maturation and Build categories
- **Monthly summary** — per-person activity summary generated from epics and issue titles
- **Daily tracking** — day-by-day worklog heatmap per squad
- **GitHub Core** — injects GitHub time entries alongside Jira data
- **CSV / HTML export** — download the pivot or summary as a file

## Requirements

- Node.js 18+
- A Jira Cloud account with API access
- (Optional) A GitHub personal access token for the GitHub tab

## Getting started

### 1. Clone the repo

\```bash
git clone https://github.com/Anne-prestashop/PSTimeSheet.git
cd PSTimeSheet
\```

### 2. Install dependencies

\```bash
npm install
\```

### 3. Configure credentials

\```bash
cp .env.example .env
\```

Open `.env` and fill in your values:

\```env
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_TOKEN=your_jira_api_token
GITHUB_TOKEN=your_github_token   # optional
\```

Generate a Jira API token at: https://id.atlassian.com/manage-profile/security/api-tokens

### 4. Start the server

\```bash
node server.js
\```

### 5. Open the app

Go to [http://localhost:8080](http://localhost:8080) — the login form will appear. Enter your Jira URL, email and token to connect.

## Project structure

\```
.
├── server.js               # Local proxy server (handles CORS, forwards Jira/GitHub API calls)
├── jira-pivot-temps.html   # Single-page app (all UI and logic)
├── .env.example             # Environment variable template
└── catalog-info.yaml        # Backstage catalog descriptor
\```

## Notes

- Credentials are loaded from `.env` and never committed to Git (`.env` is gitignored)
- The server runs locally only — it is not deployed
- The login form stores credentials in `sessionStorage` for the duration of the browser session
