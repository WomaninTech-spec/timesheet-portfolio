const PAGE_SIZE = 100;

function buildAuthHeader(email, apiToken) {
  const encoded = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Thin wrapper around the Jira Cloud REST API (v3).
 * Only implements the two calls this project needs:
 *   1. find every issue with a worklog entry in a date range
 *   2. fetch every worklog entry for one issue
 */
export class JiraClient {
  constructor({ baseUrl, email, apiToken }) {
    if (!baseUrl || !email || !apiToken) {
      throw new Error(
        'JiraClient requires baseUrl, email and apiToken (check your .env file)'
      );
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authHeader = buildAuthHeader(email, apiToken);
  }

  async _get(path) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Jira API error ${res.status} on ${path}: ${body.slice(0, 300)}`);
    }

    return res.json();
  }

  /**
   * Finds every issue that has at least one worklog entry between
   * startDate and endDate (both "YYYY-MM-DD", inclusive).
   */
  async searchIssuesWithWorklogs(startDate, endDate) {
    const jql = encodeURIComponent(
      `worklogDate >= "${startDate}" AND worklogDate <= "${endDate}"`
    );
    const fields = encodeURIComponent('project,issuetype,summary');

    let startAt = 0;
    const issues = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await this._get(
        `/rest/api/3/search?jql=${jql}&fields=${fields}&startAt=${startAt}&maxResults=${PAGE_SIZE}`
      );
      issues.push(...page.issues);
      startAt += page.issues.length;
      if (page.issues.length === 0 || startAt >= page.total) break;
    }

    return issues;
  }

  /** Fetches every worklog entry for one issue, paginated. */
  async fetchWorklogsForIssue(issueId) {
    let startAt = 0;
    const worklogs = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await this._get(
        `/rest/api/3/issue/${issueId}/worklog?startAt=${startAt}&maxResults=${PAGE_SIZE}`
      );
      worklogs.push(...page.worklogs);
      startAt += page.worklogs.length;
      if (page.worklogs.length === 0 || startAt >= page.total) break;
    }

    return worklogs;
  }
}
