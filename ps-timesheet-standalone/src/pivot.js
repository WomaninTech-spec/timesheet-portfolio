import { getCategory } from './categorize.js';
import { monthKey } from './dateUtils.js';

const HOURS_PER_DAY = 7.8; // same convention as production: 1 day = 7.8h of logged time
const SECONDS_PER_HOUR = 3600;

function secondsToDays(seconds) {
  return seconds / SECONDS_PER_HOUR / HOURS_PER_DAY;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function emptyTotals() {
  return { maturationSeconds: 0, buildSeconds: 0 };
}

function addSeconds(totals, category, seconds) {
  const key = category === 'MATURATION' ? 'maturationSeconds' : 'buildSeconds';
  totals[key] += seconds;
}

function toDaysEntry(totals) {
  const maturationDays = round2(secondsToDays(totals.maturationSeconds));
  const buildDays = round2(secondsToDays(totals.buildSeconds));
  return { maturationDays, buildDays, totalDays: round2(maturationDays + buildDays) };
}

/**
 * Fetches Jira worklogs for the given date range and aggregates them into:
 *   - pivot:   space -> person -> month -> { maturationDays, buildDays, totalDays }
 *   - summary: person -> { maturationDays, buildDays, totalDays } (whole range)
 *
 * @param {import('./jiraClient.js').JiraClient} jiraClient
 * @param {{ startDate: string, endDate: string }} range both "YYYY-MM-DD"
 */
export async function buildPivot(jiraClient, { startDate, endDate }) {
  const issues = await jiraClient.searchIssuesWithWorklogs(startDate, endDate);

  const pivotTotals = {}; // space -> person -> month -> totals
  const summaryTotals = {}; // person -> totals

  for (const issue of issues) {
    const category = getCategory(issue.fields?.issuetype?.name);
    if (!category) continue; // issue type not tracked (e.g. Bug) -> ignored

    const space = issue.fields?.project?.key ?? 'UNKNOWN';
    const worklogs = await jiraClient.fetchWorklogsForIssue(issue.id);

    for (const worklog of worklogs) {
      const startedDate = worklog.started?.slice(0, 10);
      if (!startedDate || startedDate < startDate || startedDate > endDate) continue;

      const person =
        worklog.author?.displayName ?? worklog.author?.emailAddress ?? 'Unknown';
      const month = monthKey(startedDate);
      const seconds = worklog.timeSpentSeconds ?? 0;

      pivotTotals[space] ??= {};
      pivotTotals[space][person] ??= {};
      pivotTotals[space][person][month] ??= emptyTotals();
      addSeconds(pivotTotals[space][person][month], category, seconds);

      summaryTotals[person] ??= emptyTotals();
      addSeconds(summaryTotals[person], category, seconds);
    }
  }

  return {
    pivot: convertPivotToDays(pivotTotals),
    summary: convertSummaryToDays(summaryTotals),
  };
}

function convertPivotToDays(pivotTotals) {
  const result = {};
  for (const [space, people] of Object.entries(pivotTotals)) {
    result[space] = {};
    for (const [person, months] of Object.entries(people)) {
      result[space][person] = {};
      for (const [month, totals] of Object.entries(months)) {
        result[space][person][month] = toDaysEntry(totals);
      }
    }
  }
  return result;
}

function convertSummaryToDays(summaryTotals) {
  const result = {};
  for (const [person, totals] of Object.entries(summaryTotals)) {
    result[person] = toDaysEntry(totals);
  }
  return result;
}
