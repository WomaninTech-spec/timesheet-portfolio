import 'dotenv/config';
import express from 'express';
import { JiraClient } from './src/jiraClient.js';
import { buildPivot } from './src/pivot.js';
import { monthRangeToDates } from './src/dateUtils.js';
import { TtlCache } from './src/cache.js';
import { summaryToCsv, pivotToCsv } from './src/csv.js';

const app = express();
const PORT = process.env.PORT || 8080;
const cache = new TtlCache(Number(process.env.CACHE_TTL_MINUTES) || 30);

let jiraClient;
function getJiraClient() {
  // Lazy init so the server can boot (and serve /public) even before .env is filled in.
  if (!jiraClient) {
    jiraClient = new JiraClient({
      baseUrl: process.env.JIRA_BASE_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
    });
  }
  return jiraClient;
}

async function getCachedResult(startMonth, endMonth) {
  const cacheKey = `${startMonth}:${endMonth}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  const { startDate, endDate } = monthRangeToDates(startMonth, endMonth);
  const result = await buildPivot(getJiraClient(), { startDate, endDate });
  cache.set(cacheKey, result);
  return { ...result, cached: false };
}

function parseMonthParams(req, res) {
  const { startMonth, endMonth } = req.query;
  if (!startMonth || !endMonth) {
    res.status(400).json({ error: 'startMonth and endMonth are required, format "YYYY-MM"' });
    return null;
  }
  return { startMonth, endMonth };
}

app.use(express.static('public'));

app.get('/api/pivot', async (req, res) => {
  const params = parseMonthParams(req, res);
  if (!params) return;

  try {
    const result = await getCachedResult(params.startMonth, params.endMonth);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/pivot.csv', async (req, res) => {
  const params = parseMonthParams(req, res);
  if (!params) return;

  try {
    const { pivot } = await getCachedResult(params.startMonth, params.endMonth);
    res.type('text/csv').attachment('pivot.csv').send(pivotToCsv(pivot));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/summary.csv', async (req, res) => {
  const params = parseMonthParams(req, res);
  if (!params) return;

  try {
    const { summary } = await getCachedResult(params.startMonth, params.endMonth);
    res.type('text/csv').attachment('summary.csv').send(summaryToCsv(summary));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PS TimeSheet (standalone) running on http://localhost:${PORT}`);
});
