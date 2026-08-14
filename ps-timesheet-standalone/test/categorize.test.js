import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCategory, Category } from '../src/categorize.js';

test('Epic and Spike map to Maturation', () => {
  assert.equal(getCategory('Epic'), Category.MATURATION);
  assert.equal(getCategory('Spike'), Category.MATURATION);
});

test('any type containing "opportunit" maps to Maturation, case-insensitively', () => {
  assert.equal(getCategory('Opportunity'), Category.MATURATION);
  assert.equal(getCategory('OPPORTUNITY REVIEW'), Category.MATURATION);
});

test('Story, Subtask, Sub-task and Improvement map to Build', () => {
  assert.equal(getCategory('Story'), Category.BUILD);
  assert.equal(getCategory('Subtask'), Category.BUILD);
  assert.equal(getCategory('Sub-task'), Category.BUILD);
  assert.equal(getCategory('Improvement'), Category.BUILD);
});

test('categorization is case-insensitive and trims whitespace', () => {
  assert.equal(getCategory('  story '), Category.BUILD);
  assert.equal(getCategory('EPIC'), Category.MATURATION);
});

test('unknown or missing issue types are ignored', () => {
  assert.equal(getCategory('Bug'), null);
  assert.equal(getCategory('Task'), null);
  assert.equal(getCategory(undefined), null);
  assert.equal(getCategory(''), null);
});
