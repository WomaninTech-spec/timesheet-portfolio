import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthRangeToDates, monthKey } from '../src/dateUtils.js';

test('monthRangeToDates covers full first and last month, inclusive', () => {
  assert.deepEqual(monthRangeToDates('2026-06', '2026-08'), {
    startDate: '2026-06-01',
    endDate: '2026-08-31',
  });
});

test('monthRangeToDates handles a single-month range and leap-year February', () => {
  assert.deepEqual(monthRangeToDates('2024-02', '2024-02'), {
    startDate: '2024-02-01',
    endDate: '2024-02-29',
  });
});

test('monthRangeToDates rejects malformed input', () => {
  assert.throws(() => monthRangeToDates('2026-6', '2026-08'));
  assert.throws(() => monthRangeToDates('June 2026', '2026-08'));
});

test('monthKey extracts "YYYY-MM" from a date string', () => {
  assert.equal(monthKey('2026-06-15'), '2026-06');
  assert.equal(monthKey('2026-06-15T10:00:00.000+0000'), '2026-06');
});
