import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPivot } from '../src/pivot.js';

function fakeJiraClient({ issues, worklogsByIssueId }) {
  return {
    async searchIssuesWithWorklogs() {
      return issues;
    },
    async fetchWorklogsForIssue(issueId) {
      return worklogsByIssueId[issueId] ?? [];
    },
  };
}

test('aggregates worklogs by space, person, month and category, ignoring untracked issue types', async () => {
  const issues = [
    { id: '1', fields: { project: { key: 'DEV' }, issuetype: { name: 'Story' } } },
    { id: '2', fields: { project: { key: 'DEV' }, issuetype: { name: 'Epic' } } },
    { id: '3', fields: { project: { key: 'DEV' }, issuetype: { name: 'Bug' } } }, // not tracked
  ];
  const worklogsByIssueId = {
    // 1 full day of Build (7.8h)
    1: [{ author: { displayName: 'Alice' }, started: '2026-06-10T10:00:00.000+0000', timeSpentSeconds: 3600 * 7.8 }],
    // 0.5 day of Maturation (3.9h)
    2: [{ author: { displayName: 'Alice' }, started: '2026-06-15T10:00:00.000+0000', timeSpentSeconds: 3600 * 3.9 }],
    // Bug worklog must never appear in the output
    3: [{ author: { displayName: 'Bob' }, started: '2026-06-10T10:00:00.000+0000', timeSpentSeconds: 3600 * 7.8 }],
  };

  const client = fakeJiraClient({ issues, worklogsByIssueId });
  const { pivot, summary } = await buildPivot(client, { startDate: '2026-06-01', endDate: '2026-06-30' });

  assert.equal(pivot.DEV.Alice['2026-06'].buildDays, 1);
  assert.equal(pivot.DEV.Alice['2026-06'].maturationDays, 0.5);
  assert.equal(pivot.DEV.Alice['2026-06'].totalDays, 1.5);

  assert.equal(summary.Alice.totalDays, 1.5);
  assert.equal(pivot.DEV.Bob, undefined);
  assert.equal(summary.Bob, undefined);
});

test('excludes worklog entries outside the requested date range', async () => {
  const issues = [{ id: '1', fields: { project: { key: 'DEV' }, issuetype: { name: 'Story' } } }];
  const worklogsByIssueId = {
    1: [
      { author: { displayName: 'Alice' }, started: '2026-05-31T23:59:00.000+0000', timeSpentSeconds: 3600 * 7.8 },
      { author: { displayName: 'Alice' }, started: '2026-06-01T00:01:00.000+0000', timeSpentSeconds: 3600 * 7.8 },
    ],
  };

  const client = fakeJiraClient({ issues, worklogsByIssueId });
  const { summary } = await buildPivot(client, { startDate: '2026-06-01', endDate: '2026-06-30' });

  // Only the June 1st entry should count -> exactly 1 day, not 2.
  assert.equal(summary.Alice.totalDays, 1);
});

test('falls back to author email when displayName is missing', async () => {
  const issues = [{ id: '1', fields: { project: { key: 'DEV' }, issuetype: { name: 'Story' } } }];
  const worklogsByIssueId = {
    1: [{ author: { emailAddress: 'someone@example.com' }, started: '2026-06-10T10:00:00.000+0000', timeSpentSeconds: 3600 }],
  };

  const client = fakeJiraClient({ issues, worklogsByIssueId });
  const { summary } = await buildPivot(client, { startDate: '2026-06-01', endDate: '2026-06-30' });

  assert.ok('someone@example.com' in summary);
});
